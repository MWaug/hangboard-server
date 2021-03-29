import mongoose, { Schema } from "mongoose"

export type HangEventType = {
    startTime: Date,
    endTime: Date,
    maxWeight: number,
    aveWeight: number,
    user: String,
    device: String,
    t: number[],
    weight: number[],
    meta: {}
  }
  
export interface MongTSType extends HangEventType, mongoose.Document {};
  
// Define schemas
let HangEventSchema: Schema = new Schema({
  startTime: {type: Date, required: true},
  endTime: {type: Date, required: true},
  maxWeight: Number, // Lbs
  aveWeight: Number, // Lbs
  user: String,
  device: Number,
  t: [Number], // Raw hang data
  v: [Number],  // Raw hang data
  meta: {},
});

// Compile model from schema
export var HangEvent = mongoose.model<MongTSType>('hang_events', HangEventSchema);

/**
 * Save hang event to the database
 * @param hang_event hang_event 
 */
 export function saveHangEvent(hangEvent: HangEventType) {
  // Save the new model instance, passing a callback
  const hangEventInst: mongoose.Document = new HangEvent(hangEvent);
  hangEventInst.save(function (err) {
    if (err) console.log(err);
    // saved!
  });
}

