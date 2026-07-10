import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Normalize a user-provided address into a URL to probe.
function toUrl(address: string): string {
  const a = address.trim();
  if (!a) throw new Error("Empty address");
  if (/^https?:\/\//i.test(a)) return a;
  // bare host or host:port → https by default
  return `https://${a}`;
}

const ProbeInput = z.object({
  address: z.string().min(1).max(500),
  timeout_ms: z.number().int().min(500).max(30000).default(5000),
});

type ProbeResult = {
  address: string;
  status: "online" | "offline";
  status_code: number | null;
  latency_ms: number | null;
  error: string | null;
  checked_at: string;
};

async function probeOne(address: string, timeout_ms: number): Promise<ProbeResult> {
  const url = toUrl(address);
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeout_ms);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "NetWatchPro/1.0 (+https://netwatch.pro)" },
    });
    const latency = Date.now() - start;
    return {
      address,
      status: res.ok || res.status < 500 ? "online" : "offline",
      status_code: res.status,
      latency_ms: latency,
      error: null,
      checked_at: new Date().toISOString(),
    };
  } catch (e) {
    return {
      address,
      status: "offline",
      status_code: null,
      latency_ms: null,
      error: e instanceof Error ? e.message : String(e),
      checked_at: new Date().toISOString(),
    };
  } finally {
    clearTimeout(t);
  }
}

// Probe an ad-hoc address (not tied to a target row).
export const probeAdHoc = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProbeInput.parse(d))
  .handler(async ({ data }) => probeOne(data.address, data.timeout_ms));

const BatchInput = z.object({
  job_id: z.number().int(),
  targets: z.array(z.object({ id: z.number().int(), address: z.string() })).min(1).max(50),
  timeout_ms: z.number().int().min(500).max(30000).default(5000),
});

// Probe a batch of user's targets and persist results + update the job counters.
export const probeBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => BatchInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const results = await Promise.all(
      data.targets.map((t) => probeOne(t.address, data.timeout_ms).then((r) => ({ ...r, target_id: t.id }))),
    );

    // Insert scan_results
    await supabase.from("scan_results").insert(
      results.map((r) => ({
        job_id: data.job_id,
        target_id: r.target_id,
        user_id: userId,
        address: r.address,
        status: r.status,
        status_code: r.status_code,
        latency_ms: r.latency_ms,
        error: r.error,
        checked_at: r.checked_at,
      })),
    );

    // Update each target
    for (const r of results) {
      const { data: cur } = await supabase
        .from("targets")
        .select("checks_total, checks_online")
        .eq("id", r.target_id)
        .single();
      const total = (cur?.checks_total ?? 0) + 1;
      const online = (cur?.checks_online ?? 0) + (r.status === "online" ? 1 : 0);
      await supabase
        .from("targets")
        .update({
          status: r.status,
          status_code: r.status_code,
          latency_ms: r.latency_ms,
          last_checked_at: r.checked_at,
          checks_total: total,
          checks_online: online,
          availability: total > 0 ? (online / total) * 100 : 0,
        })
        .eq("id", r.target_id);
    }

    // Update job aggregates
    const online = results.filter((r) => r.status === "online").length;
    const offline = results.length - online;
    const latencies = results.map((r) => r.latency_ms).filter((v): v is number => v != null);
    const avg = latencies.length ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) : null;

    const { data: job } = await supabase.from("scan_jobs").select("*").eq("id", data.job_id).single();
    if (job) {
      const completed = job.completed + results.length;
      const newAvg = avg != null
        ? Math.round(((job.avg_latency_ms ?? avg) * (job.completed || 1) + avg * results.length) / (completed || 1))
        : job.avg_latency_ms;
      await supabase
        .from("scan_jobs")
        .update({
          completed,
          online: job.online + online,
          offline: job.offline + offline,
          avg_latency_ms: newAvg,
          status: completed >= job.total ? "completed" : "running",
          finished_at: completed >= job.total ? new Date().toISOString() : null,
        })
        .eq("id", data.job_id);
    }

    await supabase.from("activity_logs").insert({
      user_id: userId,
      level: "info",
      message: `Probed ${results.length} targets (${online} online, ${offline} offline)`,
      meta: { job_id: data.job_id },
    });

    return { results };
  });

const CreateJobInput = z.object({
  target_ids: z.array(z.number().int()).min(1),
});

export const createScanJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreateJobInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: job, error } = await supabase
      .from("scan_jobs")
      .insert({
        user_id: userId,
        status: "running",
        total: data.target_ids.length,
        requested: data.target_ids.length,
      })
      .select()
      .single();
    if (error) throw error;
    return job;
  });
