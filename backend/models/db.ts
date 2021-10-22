import mqtt from "mqtt";
import { TSType, makeTimeSeriesRecords } from "./time_series.model";
import { HangEventType } from "./hang_event.model";

import "firebase/auth";
import { DocumentData } from "@firebase/firestore";
// import { initializeApp } from "firebase-admin";
import admin from "firebase-admin";
import { credential } from "firebase-admin";
import { BACKEND_KEY_PATH, DB_URI } from "../app_secrets";

const cred = credential.cert(BACKEND_KEY_PATH);

const app = admin.initializeApp({
  credential: cred,
  databaseURL: DB_URI,
});

export const db = admin.firestore(app);
export const hangEventsCollection = db.collection("hang_events");
export default app;

export const firestoreFromHangEvent = (he: HangEventType): DocumentData => {
  const newDocRef: DocumentData = {
    aveWeight: he.aveWeight,
    device: he.device,
    endTime: he.endTimeMs,
    maxWeight: he.maxWeight,
    recvTime: he.recvTime,
    startTime: he.startTimeMs,
    user: he.user,
    times: he.times,
    weight: he.weight,
  };
  return newDocRef;
};

export function recordsFromMQTTPacket(
  packet: mqtt.IPublishPacket,
  bucketSize: number = 1,
  meta: {} = {}
): TSType[] {
  var stringBuf = packet.payload.toString("utf-8");
  try {
    var json = JSON.parse(stringBuf);
    var t = json["t"];
    var v = json["v"];
    if (t == undefined || v == undefined) {
      throw new Error(`t and v not found in MQTT message: ${json}`);
    }
    return makeTimeSeriesRecords(t, v, (bucketSize = bucketSize), (meta = meta));
  } catch (e) {
    console.log("Could not save mqtt packet");
    console.log(packet);
    return [];
  }
}

function HangEventFromPacket(packet: mqtt.IPublishPacket): HangEventType {
  var stringBuf = packet.payload.toString("utf-8");
  var json = JSON.parse(stringBuf);
  const hasWeight = Object.keys(json).includes("weight");
  const times: number[] = hasWeight ? json["times"] : [];
  const weight: number[] = hasWeight ? json["weight"] : [];
  let he: HangEventType = {
    recvTime: new Date(),
    maxWeight: json["max_weight"],
    aveWeight: json["ave_weight"],
    startTimeMs: json["start_hang_ms"],
    endTimeMs: json["end_hang_ms"],
    times: times,
    weight: weight,
    curTimeMs: json["cur_time_ms"],
    // TODO: Lookup current user connected to the device
    user: "testUser",
    device: json["device_id"],
    meta: {},
  };
  return he;
}

export async function saveMQTTPacket(packet: mqtt.IPublishPacket) {
  try {
    // Only save hang events. Ignore the raw data stream
    if (packet.topic == "finish_hang_event") {
      await saveHangEvent(HangEventFromPacket(packet));
    }
  } catch (e) {
    console.log("Could not save mqtt packet");
    console.log(packet);
    console.log(e);
    throw e;
  }
}

/**
 * Save hang event to the database
 * @param hang_event hang_event
 */
export const saveHangEvent = async (hangEvent: HangEventType) => {
  return await new Promise<admin.firestore.DocumentReference>((resolve) =>
    resolve(db.collection("hang_events").add(firestoreFromHangEvent(hangEvent)))
  );
};
