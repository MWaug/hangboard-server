import { exception } from "console";
// import { MongoClient } from "mongodb";
import { DB_URI } from "../app_secrets"
import mqtt from "mqtt";
import mongoose from "mongoose"
import { TSType, makeTimeSeriesRecords, saveTS } from "./time_series.model"
import { HangEventType, saveHangEvent } from "./hang_event.model";

//Set up default mongoose connection
var mongoDB = DB_URI;
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});

//Get the default connection
export var db = mongoose.connection;

//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export function recordsFromMQTTPacket(packet: mqtt.IPublishPacket, bucketSize: number = 1, meta: {} = {}): 
  TSType[]{
  var stringBuf = packet.payload.toString('utf-8');
  try {
    var json = JSON.parse(stringBuf);
    var t = json["t"];
    var v = json["v"];
    if(t == undefined || v == undefined){
      throw exception(`t and v not found in MQTT message: ${json}`);
    }
    return makeTimeSeriesRecords(t, v, bucketSize=bucketSize, meta=meta);
  } catch (e) {
    console.log( "Could not save mqtt packet" )
    console.log( packet );
    return []
  }
}

function HangEventFromPacket(packet: mqtt.IPublishPacket): HangEventType {
  var stringBuf = packet.payload.toString('utf-8');
  var json = JSON.parse(stringBuf);
  let he: HangEventType = {
    maxWeight: json["max_weight"],
    aveWeight: json["ave_weight"],
    startTime: json["start_hang_ms"],
    endTime: json["end_hang_ms"],
    t: [],
    weight: [],
    user: "testUser",
    device: "",
    meta: {}
  }
  return he;
}

export function saveMQTTPacket (packet: mqtt.IPublishPacket) {
  try{
    if(packet.topic == "testtopic"){
      const records = recordsFromMQTTPacket(packet);
      records.forEach(async (record) => {
        saveTS(record);
      });
    } else if( packet.topic == "finish_hang_event" ) {
      saveHangEvent(HangEventFromPacket(packet));
    } 
  } catch (e) {
    console.log( "Could not save mqtt packet" );
    console.log( packet );
  }
}
