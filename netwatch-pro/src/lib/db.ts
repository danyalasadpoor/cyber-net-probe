import { Capacitor } from "@capacitor/core";
import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection,
} from "@capacitor-community.sqlite";

import type { Target, ScanRecord } from "@/types";
import targetList from "@/data/targets-source.json";


const DB_NAME = "netwatch_pro";
const DB_VERSION = 1;


let sqlite: SQLiteConnection | null = null;
let db: SQLiteDBConnection | null = null;
let ready: Promise<void> | null = null;



async function setupWeb() {

  const platform = Capacitor.getPlatform();

  if (platform !== "web") return;


  const loader = await import("jeep-sqlite/loader");

  loader.defineCustomElements(window);


  const jeepEl = document.createElement("jeep-sqlite");

  document.body.appendChild(jeepEl);


  await customElements.whenDefined(
    "jeep-sqlite"
  );


  await CapacitorSQLite.initWebStore();

}




export async function initDatabase(): Promise<void> {


  if (ready) return ready;



  ready = (async()=>{


    await setupWeb()
      .catch(e =>
        console.warn(
          "web sqlite setup:",
          e
        )
      );



    sqlite = new SQLiteConnection(
      CapacitorSQLite
    );



    const isConn =
      (
        await sqlite.isConnection(
          DB_NAME,
          false
        )
      ).result;



    db = isConn

      ? await sqlite.retrieveConnection(
          DB_NAME,
          false
        )

      : await sqlite.createConnection(
          DB_NAME,
          false,
          "no-encryption",
          DB_VERSION,
          false
        );



    await db.open();


    await db.execute(
      SCHEMA
    );



    await seedIfEmpty();

const check =
  await db.query(
    "SELECT COUNT(*) as c FROM targets"
  );

console.log(
  "TOTAL TARGETS:",
  check.values?.[0]?.c
);

  })();



  return ready;

}






const SCHEMA = `
CREATE TABLE IF NOT EXISTS targets (

 id INTEGER PRIMARY KEY AUTOINCREMENT,

 name TEXT NOT NULL,

 address TEXT NOT NULL,

 category TEXT NOT NULL DEFAULT 'general',

 tags TEXT NOT NULL DEFAULT '',

 notes TEXT NOT NULL DEFAULT '',

 favorite INTEGER NOT NULL DEFAULT 0,

 status TEXT NOT NULL DEFAULT 'unknown',

 latency REAL,

 availability REAL NOT NULL DEFAULT 0,

 last_checked INTEGER,

 created_at INTEGER NOT NULL DEFAULT
 (strftime('%s','now')*1000)

);


CREATE INDEX IF NOT EXISTS idx_targets_status
ON targets(status);


CREATE TABLE IF NOT EXISTS scans (

 id INTEGER PRIMARY KEY AUTOINCREMENT,

 scan_id TEXT NOT NULL,

 target_id INTEGER,

 status TEXT NOT NULL DEFAULT 'unknown',

 latency REAL,

 created_at INTEGER NOT NULL DEFAULT
 (strftime('%s','now')*1000)

);


CREATE INDEX IF NOT EXISTS idx_scans_scan_id
ON scans(scan_id);
`;



CREATE INDEX IF NOT EXISTS idx_targets_status
ON targets(status);



CREATE INDEX IF NOT EXISTS idx_targets_category
ON targets(category);



CREATE INDEX IF NOT EXISTS idx_targets_favorite
ON targets(favorite);



CREATE INDEX IF NOT EXISTS idx_targets_name
ON targets(name);



CREATE INDEX IF NOT EXISTS idx_targets_last
ON targets(last_checked);



CREATE TABLE IF NOT EXISTS scans (

 id INTEGER PRIMARY KEY AUTOINCREMENT,

 started_at INTEGER NOT NULL,

 finished_at INTEGER,

 total INTEGER NOT NULL DEFAULT 0,

 online INTEGER NOT NULL DEFAULT 0,

 offline INTEGER NOT NULL DEFAULT 0,

 avg_latency REAL,

 status TEXT NOT NULL DEFAULT 'running'

);



CREATE INDEX IF NOT EXISTS idx_scans_started
ON scans(started_at);



CREATE TABLE IF NOT EXISTS scan_samples (

 id INTEGER PRIMARY KEY AUTOINCREMENT,

 scan_id INTEGER NOT NULL,

 target_id INTEGER NOT NULL,

 status TEXT NOT NULL,

 latency REAL,

 ts INTEGER NOT NULL,

 FOREIGN KEY(scan_id)
 REFERENCES scans(id)
 ON DELETE CASCADE

);



CREATE INDEX IF NOT EXISTS idx_samples_scan
ON scan_samples(scan_id);



CREATE INDEX IF NOT EXISTS idx_samples_target
ON scan_samples(target_id);



;



function getDb(): SQLiteDBConnection {

 if(!db)
   throw new Error(
     "Database not initialized"
   );


 return db;

}

async function seedIfEmpty() {

  const res = await getDb().query(
    "SELECT COUNT(*) as c FROM targets"
  );


  const count =
    (res.values?.[0]?.c as number) ?? 0;


  if (count > 0) {
    return;
  }



  if (!Array.isArray(targetList) || targetList.length === 0) {

    console.warn(
  "targets-source.json is empty. No targets imported."
);

    return;
  }



  const limit = Math.min(
    targetList.length,
    20000
  );



  const batchSize = 500;



  for (
    let i = 0;
    i < limit;
    i += batchSize
  ) {


    const batch = targetList.slice(
      i,
      i + batchSize
    );


    const items = batch.map((t:any)=>({

      name:
        t.name ||
        t.address ||
        "Unknown",


      address:
        t.address ||
        "",


      category:
        t.category ||
        "general",


      tags:
        t.tags ||
        "",


      notes:
        t.notes ||
        ""

    }));



    await bulkInsertTargets(
      items
    );



  }



  console.log(
    `Imported ${limit} targets`
);

}






// ---------- Targets ----------


export interface TargetsQuery {

  search?: string;

  category?: string;

  status?: string;

  favoriteOnly?: boolean;

  limit?: number;

  offset?: number;

}






export async function bulkInsertTargets(
  items: Array<
    Pick<
      Target,
      "name" |
      "address" |
      "category" |
      "tags" |
      "notes"
    >
  >
): Promise<number> {


  if (!items.length)
    return 0;



  const statements =
    items.map(t => ({

      statement:
      
      INSERT INTO targets
      (
        name,
        address,
        category,
        tags,
        notes
      )
      VALUES
      (?,?,?,?,?)
      ,


      values:
      [
        t.name,
        t.address,
        t.category || "general",
        t.tags || "",
        t.notes || ""
      ]

    }));



  const result =
    await getDb().executeSet(
      statements
    );



  return (
    result.changes?.changes ??
    items.length
  );

}

// ---------- Targets ----------


export async function listTargets(
  q: TargetsQuery = {}
): Promise<{
  rows: Target[];
  total: number;
}> {


  const where:string[] = [];
  const args:any[] = [];



  if(q.search){

    where.push(
      "(name LIKE ? OR address LIKE ? OR tags LIKE ?)"
    );

    const s = %${q.search}%;

    args.push(
      s,
      s,
      s
    );

  }



  if(
    q.category &&
    q.category !== "all"
  ){

    where.push(
      "category = ?"
    );

    args.push(
      q.category
    );

  }



  if(
    q.status &&
    q.status !== "all"
  ){

    where.push(
      "status = ?"
    );

    args.push(
      q.status
    );

  }



  if(q.favoriteOnly){

    where.push(
      "favorite = 1"
    );

  }



  const condition =
    where.length
    ? WHERE ${where.join(" AND ")}
    : "";



  const totalResult =
    await getDb().query(
      
      SELECT COUNT(*) as c
      FROM targets
      ${condition}
      ,
      args
    );



  const total =
    totalResult.values?.[0]?.c ?? 0;



  const limit =
    q.limit ?? 50;


  const offset =
    q.offset ?? 0;



  const result =
    await getDb().query(
      
      SELECT *
      FROM targets
      ${condition}
      ORDER BY favorite DESC, name ASC
      LIMIT ? OFFSET ?
      ,
      [
        ...args,
        limit,
        offset
      ]
    );



  return {

    rows:
      (result.values as Target[])
      ?? [],

    total:
      total as number

  };

}






export async function getTarget(
  id:number
):Promise<Target|null>{


 const r =
 await getDb().query(
   "SELECT * FROM targets WHERE id=?",
   [id]
 );


 return (
   r.values?.[0] as Target
 )
 ?? null;


}






export async function createTarget(
 t:Pick<
 Target,
 "name"|
 "address"|
 "category"|
 "tags"|
 "notes"
 >
):Promise<number>{


 const r =
 await getDb().run(
 
 INSERT INTO targets
 (
 name,
 address,
 category,
 tags,
 notes
 )
 VALUES(?,?,?,?,?)
 ,
 [
  t.name,
  t.address,
  t.category || "general",
  t.tags || "",
  t.notes || ""
 ]
 );


 return r.changes?.lastId ?? 0;

}






export async function updateTarget(
 id:number,
 patch:Partial<Target>
):Promise<void>{


 const keys =
 Object.keys(patch);



 if(!keys.length)
 return;



 const set =
 keys.map(
 k=>${k}=?
 ).join(",");



 const values =
 keys.map(
 k=>(patch as any)[k]
 );



 await getDb().run(
 
 UPDATE targets
 SET ${set}
 WHERE id=?
 ,
 [
  ...values,
  id
 ]
 );


}






export async function deleteTarget(
 id:number
):Promise<void>{


 await getDb().run(
  "DELETE FROM targets WHERE id=?",
  [id]
 );


}






export async function toggleFavorite(
 id:number
):Promise<void>{


 await getDb().run(
 
 UPDATE targets
 SET favorite =
 CASE favorite
 WHEN 1 THEN 0
 ELSE 1
 END
 WHERE id=?
 ,
 [id]
 );


}






export async function updateStatusMany(
 updates:Array<{
 id:number;
 status:string;
 latency:number|null;
 ts:number;
 }>
):Promise<void>{


 if(!updates.length)
 return;



 const statements =
 updates.map(u=>({

 statement:
 
 UPDATE targets
 SET
 status=?,
 latency=?,
 last_checked=?
 WHERE id=?
 ,


 values:[
  u.status,
  u.latency,
  u.ts,
  u.id
 ]

 }));



 await getDb().executeSet(
   statements
 );

}






// ---------- Scans ----------


export async function createScan(
 total:number
):Promise<number>{


 const r =
 await getDb().run(
 
 INSERT INTO scans
 (
 started_at,
 total,
 status
 )
 VALUES
 (? , ?, 'running')
 ,
 [
  Date.now(),
  total
 ]
 );


 return r.changes?.lastId ?? 0;

}






export async function finishScan(
 id:number,
 online:number,
 offline:number,
 avgLatency:number|null,
 cancelled=false
):Promise<void>{


 await getDb().run(
 
 UPDATE scans
 SET
 finished_at=?,
 online=?,
 offline=?,
 avg_latency=?,
 status=?
 WHERE id=?
 ,
 [
 Date.now(),
 online,
 offline,
 avgLatency,
 cancelled
 ? "cancelled"
 : "completed",
 id
 ]
 );


}






export async function addScanSample(
 scanId:number,
 targetId:number,
 status:string,
 latency:number|null
):Promise<void>{

await getDb().run(
 
 INSERT INTO scan_samples
 (
 scan_id,
 target_id,
 status,
 latency,
 ts
 )
 VALUES
 (?,?,?,?,?)
 ,
 [
  scanId,
  targetId,
  status,
  latency,
  Date.now()
 ]
 );


}






export async function listScans(
 limit=100
):Promise<ScanRecord[]>{


 const r =
 await getDb().query(
 
 SELECT *
 FROM scans
 ORDER BY started_at DESC
 LIMIT ?
 ,
 [limit]
 );


 return (
 r.values as ScanRecord[]
 )
 ?? [];


}






export async function dashboardStats(){


 const total =
 await getDb().query(
 "SELECT COUNT(*) as c FROM targets"
 );


 const online =
 await getDb().query(
 "SELECT COUNT(*) as c FROM targets WHERE status='online'"
 );


 const offline =
 await getDb().query(
 "SELECT COUNT(*) as c FROM targets WHERE status='offline'"
 );


 return {

 total:
 total.values?.[0]?.c ?? 0,

 online:
 online.values?.[0]?.c ?? 0,

 offline:
 offline.values?.[0]?.c ?? 0

 };


}






export async function exportAll(){


 const targets =
 await getDb().query(
 "SELECT * FROM targets"
 );


 const scans =
 await getDb().query(
 "SELECT * FROM scans"
 );



 return {

 targets:
 (targets.values as Target[])
 ?? [],


 scans:
 (scans.values as ScanRecord[])
 ?? []

 };


}


export async function exportAll(){

 const targets =
 await getDb().query(
 "SELECT * FROM targets"
 );


 const scans =
 await getDb().query(
 "SELECT * FROM scans"
 );


 return {

 targets:
 (targets.values as Target[])
 ?? [],


 scans:
 (scans.values as ScanRecord[])
 ?? []

 };

}


// اینجا اضافه کن 👇

export async function getRecentResults(
  limit = 100
): Promise<Target[]> {

  const r = await getDb().query(
    `
    SELECT *
    FROM targets
    WHERE last_checked IS NOT NULL
    ORDER BY last_checked DESC
    LIMIT ?
    `,
    [limit]
  );

  return (r.values as Target[]) ?? [];

}



export async function wipeAll(){

  await getDb().execute(
    `
    DELETE FROM scan_samples;

    DELETE FROM scans;

    DELETE FROM targets;
    `
  );

}


export async function scanTrend(days = 14) {

  const result = await getDb().query(
    `
    SELECT
      started_at,
      online,
      offline,
      avg_latency
    FROM scans
    ORDER BY started_at DESC
    LIMIT ?
    `,
    [days]
  );


  return result.values ?? [];

}
export async function categories() {

  const result = await getDb().query(
    `
    SELECT DISTINCT category
    FROM targets
    ORDER BY category ASC
    `
  );


  return (result.values ?? [])
    .map((r:any) => r.category)
    .filter(Boolean);

}
export async function getRecentResults(
  limit = 200
) {

  const result = await getDb().query(
    `
    SELECT *
    FROM targets
    WHERE last_checked IS NOT NULL
    ORDER BY last_checked DESC
    LIMIT ?
    `,
    [
      limit
    ]
  );


  return (result.values as Target[]) ?? [];

}
