import { exception } from "console";
import { MongoClient } from "mongodb";
import { isArrayLiteralExpression } from "typescript/lib/typescript";
import { DB_URI } from "../app_secrets"

// Replace the uri string with your MongoDB deployment's connection string.
const client = new MongoClient(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// TODO: Add all CRUD functions
export async function dbAdd(dbName: string, collectionName: string, item: any) {
  try {
    await client.connect();
    let dbo = await client.db(dbName);
    await dbo.collection(collectionName).insertOne(item);
  } catch (err) {
    console.log(err);
    client.close();
    throw (err);
  }
  client.close();
}

/**
 * Chunk an array into parts no larger than chunkSize.
 * Undersized arrays will have smaller chunks at the tail end
 * @param x Input array
 * @param chunkSize Maximum number of elements in a chunk
 */
export function chunkArray<T>(x: T[], chunkSize: number): T[][] {
  var c = [];
  for (var i = 0; i < x.length; i += chunkSize) {
    c.push(x.slice(i, i + chunkSize));
  }
  return c;
}

/**
 * Format time series data for storage in the database. Long arrays must be split into chunks
 * @param t Array of time values for the data. Must be the same length as v
 * @param v Array of values associated with each time. Must be the same length as t
 * @param meta Metadata to store alongside the time series values
 * @param bucketSize Number of time series samples to collect together into a single bucket
 */
export function makeTimeSeriesRecords(t: number[], v: number[], bucketSize: number = 1, meta: {} = {}): {time:number[], value:number[]}[] {
  if (t.length != v.length) {
    const msg: string = `t[${t.length}] and v[${v.length}] are different lengths`;
    console.log(`t[${t.length}] and v[${v.length}] are different lengths`);
    throw exception(msg);
  }
  if (bucketSize < 1) { throw exception(`bucketSize must be greater than 0`) }

  const tChunks: number[][] = chunkArray(t, bucketSize);
  const vChunks: number[][] = chunkArray(v, bucketSize);
  var ts: {time:number[], value:number[]}[] = [];
  tChunks.forEach((tChunk,i) => {
    ts.push(Object.assign({}, {time: tChunk, value: vChunks[i]}, meta))
  });
  return ts
}

/**
 * Save a time series of measurements to the database
 * @param dbName Name of the database
 * @param collectionName Name of the collection within that database to store the time weight pair
 * @param t Times at which the data was sampled
 * @param v Value of the data at time t
 * @param meta Metadata to store along side the time series entry
 * @param bucketSize Number of time series sames stored in one database entry
 * 
 * PRE: t.length == v.length
 * PRE: bucketSize > 0
 */
export async function dbSaveTimeSeries(
  dbName: string,
  collectionName: string,
  t: number[],
  v: number[],
  bucketSize: number = 1,
  meta: {}){

  const entries = makeTimeSeriesRecords(t, v, bucketSize, meta);
  entries.forEach(entry => {
    dbAdd(dbName, collectionName, entry)
  });
}

export async function dbGetOne(dbName: string, collectionName: string, item: any) {
  try {
    await client.connect();
    let dbo = await client.db(dbName);
    let result = await dbo.collection(collectionName).findOne(item);
    client.close();
    return result;
  } catch (err) {
    console.log(err);
    client.close();
    throw (err);
  }
}
