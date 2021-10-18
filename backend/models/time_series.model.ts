import mongoose, { Schema } from "mongoose";

export type TSType = {
  startTime: number;
  t: number[];
  v: number[];
  meta: {};
};

export interface MongTSType extends TSType, mongoose.Document {}

// Compile model from schema
var TimeSeries = mongoose.model<MongTSType>("time_series", TimeSeriesSchema);
// var HangEvents = mongoose.model('HangEvents', HangEventSchema );

/**
 * Save time series data to the database
 * @param ts Time Series data to be saved
 */
export function saveTS(ts: TSType) {
  // Save the new model instance, passing a callback
  const TimeSeriesInstance: mongoose.Document = new TimeSeries(ts);
  TimeSeriesInstance.save(function (err) {
    if (err) console.log(err);
    // saved!
  });
}

export async function getTS(startTime: number) {
  return await TimeSeries.findOne({ startTime: startTime });
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
 * @param bucketSize Number of time series samples to collect together into a single bucket
 * @param meta Metadata to store alongside the time series values
 */
export function makeTimeSeriesRecords(
  t: number[],
  v: number[],
  bucketSize: number = 1,
  meta: {} = {}
): TSType[] {
  if (t.length != v.length) {
    const msg: string = `t[${t.length}] and v[${v.length}] are different lengths`;
    console.log(msg);
    throw new Error(msg);
  }
  if (bucketSize < 1) {
    throw new Error(`bucketSize must be greater than 0`);
  }

  const tChunks: number[][] = chunkArray(t, bucketSize);
  const vChunks: number[][] = chunkArray(v, bucketSize);
  var ts: TSType[] = [];
  tChunks.forEach((tChunk, i) => {
    const newRecord: TSType = {
      startTime: tChunk[0],
      t: tChunk,
      v: vChunks[i],
      meta: meta,
    };
    ts.push(newRecord);
  });
  return ts;
}
