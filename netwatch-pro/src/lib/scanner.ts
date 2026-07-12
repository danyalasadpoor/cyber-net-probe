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
  speed: number;
  eta: number;
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



  subscribe(listener: Listener) {

    this.listeners.add(listener);

    listener({
      ...this.progress
    });

    return () => {
      this.listeners.delete(listener);
    };

  }



  private emit() {

    if (!this.progress.startedAt)
      return;


    const elapsed =
      Math.max(
        1,
        (Date.now() - this.progress.startedAt) / 1000
      );


    this.progress.speed =
      this.progress.completed / elapsed;


    const remaining =
      this.progress.total -
      this.progress.completed;


    this.progress.eta =
      this.progress.speed > 0
        ? remaining / this.progress.speed
        : 0;



    for (const listener of this.listeners) {

      listener({
        ...this.progress
      });

    }

  }





  private async waitPause() {

    if (!this.progress.paused)
      return;


    await new Promise<void>((resolve) => {

      this.pauseResolver = resolve;

    });

  }





  pause() {

    if (!this.progress.running)
      return;


    this.progress.paused = true;

    log.warn(
      "Scanner paused"
    );

    this.emit();

  }





  resume() {

    if (!this.progress.paused)
      return;


    this.progress.paused = false;


    if (this.pauseResolver) {

      this.pauseResolver();

      this.pauseResolver = null;

    }


    log.info(
      "Scanner resumed"
    );


    this.emit();

  }





  stop() {

    if (!this.progress.running)
      return;


    this.cancelRequested = true;


    if (this.pauseResolver) {

      this.pauseResolver();

      this.pauseResolver = null;

    }


    log.warn(
      "Stopping scanner..."
    );


  }





  async probe(
    address: string,
    timeout: number
  ): Promise<number | null> {


    const start =
      performance.now();


    const controller =
      new AbortController();


    const timer =
      setTimeout(
        () => controller.abort(),
        timeout
      );


    try {

      let url =
        address.trim();


      if (!url.startsWith("http")) {

        url =
          "https://" + url;

      }



      await fetch(
        url,
        {
          method: "GET",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        }
      );



      return (
        performance.now() - start
      );


    } catch {

      return null;

    } finally {

      clearTimeout(timer);

    }

  }





  private async loadTargets(
    count: number
  ): Promise<Target[]> {


    const result: Target[] = [];

    const pageSize = 500;

    let offset = 0;



    while (
      result.length < count
    ) {


      const page =
        await listTargets({
          limit: pageSize,
          offset,
        });



      if (!page.rows.length)
        break;



      result.push(
        ...page.rows
      );


      offset += pageSize;



      if (
        page.rows.length < pageSize
      )
        break;

    }



    return result.slice(
      0,
      count
    );

  }

private async loadTargets(
    count: number
  ): Promise<Target[]> {

    ...
  }

async start(count: number) {

    if (this.progress.running)
      return;


    const {
      timeout,
      concurrency
    } = useSettings.getState();



    const limit =
      Math.max(
        1,
        Math.min(
          count,
          200000
        )
      );



    const targets =
      await this.loadTargets(limit);



    if (!targets.length) {

      log.error(
        "No targets found in database"
      );

      return;

    }



    const scanId =
      await createScan(
        targets.length
      );



    this.cancelRequested = false;

    this.latencySum = 0;

    this.latencyCount = 0;



    this.progress = {

      scanId,

      total:
        targets.length,

      completed: 0,

      online: 0,

      offline: 0,

      running: true,

      paused: false,

      startedAt:
        Date.now(),

      speed: 0,

      eta: 0,

    };



    log.info(
      Scan #${scanId} started (${targets.length} targets)
    );


    this.emit();



    const queue =
      [...targets];



    const workers =
      Array.from(
        {
          length:
            Math.max(
              1,
              concurrency
            )
        },
        () =>
          this.worker(
            queue,
            timeout,
            scanId
          )
      );



    await Promise.all(
      workers
    );



    const avgLatency =
      this.latencyCount
        ? this.latencySum /
          this.latencyCount
        : null;



    await finishScan(
      scanId,
      this.progress.online,
      this.progress.offline,
      avgLatency,
      this.cancelRequested
    );



    this.progress.running =
      false;



    this.emit();



    log.success(
      Scan finished: ${this.progress.online} online / ${this.progress.offline} offline
    );

  }





  private async worker(
    queue: Target[],
    timeout: number,
    scanId: number
  ) {


    const updates: Array<{
      id:number;
      status:string;
      latency:number|null;
      ts:number;
    }> = [];



    while (
      queue.length &&
      !this.cancelRequested
    ) {


      await this.waitPause();



      const target =
        queue.shift();



      if (!target)
        break;



      this.progress.currentTarget =
        target.name;



      const latency =
        await this.probe(
          target.address,
          timeout
        );



      const status =
        latency !== null
          ? "online"
          : "offline";



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



      updates.push({

        id:
          target.id,

        status,

        latency,

        ts:
          Date.now(),

      });



      addScanSample(
        scanId,
        target.id,
        status,
        latency
      ).catch(()=>{});



      if (
        updates.length >= 50
      ) {

        await updateStatusMany(
          updates.splice(0)
        );

      }



      this.emit();


    }



    if (updates.length) {

      await updateStatusMany(
        updates
      );

    }


  }

}


export const scanner =
  new ScannerEngine();
