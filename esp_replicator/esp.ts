// Hangboard testing replica
// This file replicates the MQTT transactions generated
// by the hangboard. It is used for integration and end-to-end
// testing of the webapp without the ESP8266 in the loop.

import express from "express";
import mqtt from "mqtt";
import { MOSQUITTO_PASSWD, MOSQUITTO_USER } from "./esp_secrets";

const port = 3001;
const hostname = "0.0.0.0";
const mqttHostname = "broker"; // Name of the docker service in compose
const app = express();

// App
app.get("/", (_req: any, res) => {
  console.log(`Sending`);
  res.send("Hello from ESP8266 replacement");
  console.log(`Done`);
});

app.listen(port, hostname);
console.log(`Server running at http://${hostname}:${port}/`);
console.log(`Done with listening`);

// MQTT
const client = mqtt.connect(`mqtt://${mqttHostname}`, {
  clientId: "index",
  username: MOSQUITTO_USER,
  password: MOSQUITTO_PASSWD,
});
client.on("error", (error: string) => {
  console.log("Can't connect" + error);
});
// client.on("connect",() => {	 });

// Publish an MQTT announcement every 1/10 seconds
const topic: string = "testtopic";
const qos: mqtt.QoS = 1;
const options: mqtt.IClientPublishOptions = { retain: true, qos };

// publish function
function publish(t: string, msg: string, opt: mqtt.IClientPublishOptions) {
  console.log("publishing", msg);
  if (client.connected === true) {
    client.publish(t, msg, opt);
  }
}

let publishPeriodMS: number = 300;

const weightFunction = (
  startTimeMs: number,
  endTimeMs: number,
  aveWeight: number,
  sampleTime: number
): number => {
  const duration = endTimeMs - startTimeMs;
  const riseEnd = startTimeMs + duration * 0.1;
  const fallStart = startTimeMs + duration * 0.9;

  // Rising edge
  if (sampleTime < riseEnd) {
    const slope = (aveWeight - 0) / (riseEnd - startTimeMs);
    const offset = 0;
    return slope * (sampleTime - startTimeMs) + offset;
  }

  // Constant force
  if (sampleTime > riseEnd && sampleTime < fallStart) {
    return aveWeight + Math.random() * aveWeight * 0.1;
  }

  // Falling edge
  const slope = (0 - aveWeight) / (endTimeMs - fallStart);
  const offset = aveWeight;
  return slope * (sampleTime - fallStart) + offset;
};

// Hang weight as a function of time
// t: time in milliseconds
function getWeight(t: number): number {
  const aveWeight: number = 160;
  const startTimeMs: number = 0;
  const endTimeMs: number = 10000;
  const curTime: number = t % endTimeMs;
  return weightFunction(startTimeMs, endTimeMs, aveWeight, curTime);
}

// publish every publishPeriodMS secs
const _timerID = setInterval(() => {
  const message: string = JSON.stringify({
    t: [Date.now()],
    v: [getWeight(Date.now())],
  });
  publish(topic, message, options);
}, publishPeriodMS);
