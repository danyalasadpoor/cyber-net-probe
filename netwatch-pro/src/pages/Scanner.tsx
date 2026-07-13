import { useEffect, useState } from "react";
import { Play, Pause, Square, RotateCw, Zap } from "lucide-react";

import GlassCard from "@/components/GlassCard";
import Button from "@/components/ui/Button";

import { scanner, type ScanProgress } from "@/lib/scanner";
import { getRecentResults } from "@/lib/db";

import type { Target } from "@/types";


const PRESETS = [
  10,
  100,
  1000,
  5000,
];


function toEnglishNumber(value: string) {
  return value
    .replace(/[۰-۹]/g, (d) =>
      String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    )
    .replace(/,/g, "");
}



export default function Scanner() {


  const [progress, setProgress] =
    useState<ScanProgress | null>(null);


  const [count, setCount] =
    useState<string>("100");


  const [results, setResults] =
    useState<Target[]>([]);



  const scanCount =
    Math.max(
      1,
      Number(toEnglishNumber(count)) || 1
    );



  useEffect(() => {

    const unsub =
      scanner.subscribe(
        setProgress
      );


    return () =>
      unsub();

  }, []);



  useEffect(() => {

    const load = async () => {

      const rows =
        await getRecentResults(
          scanCount
        );


      setResults(rows);

    };


    load();


    const timer =
      setInterval(
        load,
        2000
      );


    return () =>
      clearInterval(timer);


  }, [scanCount]);




  const pct =
    progress?.total
      ? Math.round(
          (progress.completed /
            progress.total) *
            100
        )
      : 0;



  const remaining =
    progress
      ? progress.total -
        progress.completed
      : 0;




  return (

    <div className="space-y-6">


      <div className="flex flex-wrap items-end justify-between gap-3">


        <div>

          <h1 className="text-2xl md:text-3xl font-semibold">

            <span className="grad-text">
              Scanner
            </span>

            {" "}

            engine

          </h1>


          <p className="text-sm text-slate-400 mt-1">

            Configure the batch size, then start.

          </p>


        </div>


      </div>




      <GlassCard title="Scan configuration">


        <div className="space-y-4">


          <div className="flex flex-wrap gap-2">


            {PRESETS.map((p) => (

              <button

                key={p}


                onClick={() =>
                  setCount(
                    String(p)
                  )
                }


                disabled={
                  progress?.running
                }


                className={`
                  px-4 py-2 rounded-lg
                  text-sm border transition
                  ${
                    scanCount === p
                      ? "bg-primary/20 border-primary/50 text-accent"
                      : "border-white/10 text-slate-300 hover:bg-white/5"
                  }
                `}


              >

                {p.toLocaleString()}


              </button>


            ))}




            <input

              type="text"

              inputMode="numeric"


              value={count}


              onChange={(e) =>
                setCount(
                  e.target.value
                )
              }


              disabled={
                progress?.running
              }


              className="
                w-32 h-10 px-3 rounded-lg
                bg-black/30 border border-white/10
                text-sm
              "


            />


          </div>
                    <div className="flex flex-wrap gap-2">


            <Button

              onClick={() =>
                scanner.start(
                  scanCount
                )
              }


              disabled={
                progress?.running
              }


            >

              <Play className="w-4 h-4" />

              Start scan


            </Button>




            {progress?.running &&
            !progress.paused && (


              <Button

                variant="ghost"


                onClick={() =>
                  scanner.pause()
                }


              >

                <Pause className="w-4 h-4" />

                Pause


              </Button>


            )}




            {progress?.running &&
            progress.paused && (


              <Button

                variant="ghost"


                onClick={() =>
                  scanner.resume()
                }


              >

                <RotateCw className="w-4 h-4" />

                Resume


              </Button>


            )}




            {progress?.running && (


              <Button

                variant="danger"


                onClick={() =>
                  scanner.stop()
                }


              >

                <Square className="w-4 h-4" />

                Stop


              </Button>


            )}



          </div>


        </div>


      </GlassCard>





      <div className="grid md:grid-cols-4 gap-4">



        <Metric

          label="Progress"

          value={`${pct}%`}

          hint={`${progress?.completed ?? 0}/${progress?.total ?? 0}`}

        />



        <Metric

          label="Remaining"

          value={
            remaining.toLocaleString()
          }

        />



        <Metric

          label="Speed"

          value={`${(progress?.speed ?? 0).toFixed(1)}/s`}

          hint="targets/sec"

        />



        <Metric

          label="ETA"

          value={

            progress?.eta

              ? `${Math.round(progress.eta)}s`

              : "—"

          }

        />


      </div>





      <GlassCard title="Live progress">



        <div className="h-3 rounded-full bg-white/5 overflow-hidden">


          <div


            className="
              h-full bg-gradient-to-r
              from-primary to-accent
              transition-all duration-300
            "


            style={{

              width: `${pct}%`

            }}


          />


        </div>





        <div className="flex justify-between text-xs text-slate-400 mt-2">



          <span>


            {progress?.running ? (


              <span className="inline-flex items-center gap-1 text-accent">


                <Zap className="w-3 h-3 animate-pulse"/>


                Scanning {progress.currentTarget ?? "..."}


              </span>


            ) : (


              "Idle"


            )}



          </span>





          <span>


            {progress?.online ?? 0}

            {" online · "}

            {progress?.offline ?? 0}

            {" offline"}



          </span>



        </div>



      </GlassCard>
            <GlassCard title={`Recent Results (${results.length})`}>

        <div className="space-y-2">


          {results.length === 0 ? (


            <p className="text-sm text-slate-400">

              No results yet

            </p>


          ) : (


            results.map((item) => (


              <div


                key={item.id}


                className="
                  flex flex-wrap
                  justify-between
                  gap-3
                  p-3 rounded-lg
                  bg-white/5
                "


              >



                <div>


                  <div className="font-medium">

                    {item.name}

                  </div>



                  <div className="text-xs text-slate-400">

                    {item.address}

                  </div>


                </div>




                <div className="flex items-center gap-3">



                  <span


                    className={

                      item.status === "online"

                        ? "text-green-400"

                        : "text-red-400"

                    }


                  >

                    {item.status}


                  </span>





                  {item.latency !== null &&
                  item.latency !== undefined && (


                    <span className="text-xs text-slate-300">


                      {Math.round(item.latency)} ms


                    </span>


                  )}



                </div>



              </div>



            ))


          )}


        </div>


      </GlassCard>


    </div>


  );


}





function Metric({

  label,

  value,

  hint,

}: {


  label: string;


  value: string;


  hint?: string;


}) {



  return (



    <GlassCard>


      <div className="text-sm text-slate-400">

        {label}

      </div>




      <div className="text-2xl font-semibold mt-1">

        {value}

      </div>




      {hint && (


        <div className="text-xs text-slate-500 mt-1">


          {hint}


        </div>


      )}



    </GlassCard>



  );

}
