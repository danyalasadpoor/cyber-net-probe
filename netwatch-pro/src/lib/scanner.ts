import {
  listTargets,
  updateStatusMany,
  createScan,
  finishScan,
  addScanSample,
} from "./db";
import { log } from "./logger";
import { useSettings } from "@/store/settings";
import type { Target } from "@/types";

export interface ScanProgress {
  scanId: number;
  total: number;
  completed: number;
  online: number;
  offline: number;
  running: boolean;
  paused: boolean;
  startedAt: number;
  currentTarget?: string;
  speed: number; // per sec
  eta: number; // seconds
}

type Listener = (p: ScanProgress) => void;

class ScannerEngine {
  private listeners = new Set<Listener>();
  private progress: ScanProgress = {
    scanId: 0,
    total: 0,
    completed: 0,
    online: 0,
    offline: 0,
    running: false,
    paused: false,
    startedAt: 0,
    speed: 0,
    eta: 0,
  };
  private cancelRequested = false;
  private pauseResolver: (() => void) | null = null;
  private latencySum = 0;
  private latencyCount = 0;

  subscribe(l: Listener) {
    this.listeners.add(l);
    l(this.progress);
    return () => this.listeners.delete(l);
  }

  private emit() {
    const now = Date.now();
    const elapsed = Math.max(1, (now - this.progress.startedAt) / 1000);
    this.progress.speed = this.progress.completed / elapsed;
    const remaining = this.progress.total - this.progress.completed;
    this.progress.eta = this.progress.speed > 0 ? remaining / this.progress.speed : 0;
    for (const l of this.listeners) l({ ...this.progress });
  }

  private async awaitPause() {
    if (!this.progress.paused) return;
    await new Promise<void>((resolve) => {
      this.pauseResolver = resolve;
    });
  }

  pause() {
    if (!this.progress.running || this.progress.paused) return;
    this.progress.paused = true;
    log.warn("Scan paused");
    this.emit();
  }

  resume() {
    if (!this.progress.paused) return;
    this.progress.paused = false;
    log.info("Scan resumed");
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    this.emit();
  }

  stop() {
    if (!this.progress.running) return;
    this.cancelRequested = true;
    if (this.pauseResolver) {
      this.pauseResolver();
      this.pauseResolver = null;
    }
    log.warn("Scan cancellation requested");
  }

  async probe(address: string, timeout: number): Promise<number | null> {
    const started = performance.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      // no-cors HEAD; opaque response is OK — we only care about reachability
      await fetch(address, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-store",
      });
      return performance.now() - started;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async start(count: number) {
    if (this.progress.running) return;
    const { timeout, concurrency } = useSettings.getState();
    const limit = Math.max(1, Math.min(count, 200_000));

    // Load a batch of targets. If fewer than requested, cycle by re-querying pages.
    const { rows: pool, total } = await listTargets({ limit, offset: 0 });
    if (!pool.length) {
      log.error("No targets in database. Add some first.");
      return;
    }
    const targets: Target[] = [];
    while (targets.length < limit) {
      targets.push(...pool.slice(0, Math.min(pool.length, limit - targets.length)));
    }

    const scanId = await createScan(targets.length);
    this.cancelRequested = false;
    this.latencySum = 0;
    this.latencyCount = 0;
    this.progress = {
      scanId,
      total: targets.length,
      completed: 0,
      online: 0,
      offline: 0,
      running: true,
      paused: false,
      startedAt: Date.now(),
      speed: 0,
      eta: 0,
    };
    log.info(`Scan #${scanId} started — ${targets.length} targets (pool ${total})`);
    this.emit();

    const queue = [...targets];
    const workers = Array.from({ length: Math.max(1, concurrency) }, () =>
      this.worker(queue, timeout, scanId),
    );
    await Promise.all(workers);

    const avg = this.latencyCount ? this.latencySum / this.latencyCount : null;
    await finishScan(
      scanId,
      this.progress.online,
      this.progress.offline,
      avg,
      this.cancelRequested,
    );
    this.progress.running = false;
    this.emit();
    log.success(
      `Scan #${scanId} ${this.cancelRequested ? "cancelled" : "completed"} — ${this.progress.online} online, ${this.progress.offline} offline`,
    );
  }

  private async worker(queue: Target[], timeout: number, scanId: number) {
    const batchUpdates: Array<{
      id: number;
      status: string;
      latency: number | null;
      ts: number;
    }> = [];
    while (queue.length && !this.cancelRequested) {
      await this.awaitPause();
      if (this.cancelRequested) break;
      const t = queue.shift();
      if (!t) break;
      this.progress.currentTarget = t.name;
      const latency = await this.probe(t.address, timeout);
      const status = latency !== null ? "online" : "offline";
      if (status === "online") {
        this.progress.online++;
        if (latency !== null) {
          this.latencySum += latency;
          this.latencyCount++;
        }
      } else {
        this.progress.offline++;
      }
      this.progress.completed++;
      batchUpdates.push({ id: t.id, status, latency, ts: Date.now() });
      addScanSample(scanId, t.id, status, latency).catch(() => {});
      if (batchUpdates.length >= 25) {
        await updateStatusMany(batchUpdates.splice(0));
      }
      if (this.progress.completed % 5 === 0) this.emit();
    }
    if (batchUpdates.length) await updateStatusMany(batchUpdates);
    this.emit();
  }
}

export const scanner = new ScannerEngine();
