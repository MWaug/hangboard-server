import express from "express";
import mqtt from "mqtt";
import { saveMQTTPacket } from "./models/db";
import { MOSQUITTO_USER, MOSQUITTO_PASSWD } from "./app_secrets"

const port = 3000;
const hostname = '0.0.0.0';
const mqttHostname = 'broker';  // Name of the docker service in compose
const app = express()

// HTTP Server
app.get("/", (_req: any, res) => {
  console.log(`Sending`);
  res.send('Hello World');
  console.log(`Done`);
})

app.listen(port, hostname);
console.log(`Server running at http://${hostname}:${port}/`);
console.log(`Done with listening`)
console.log(`Moving onto MQTT`)

// MQTT
console.log("Connecting to MQTT server");
const client  = mqtt.connect(
  `mqtt://${mqttHostname}`,
  {clientId:"index", username: MOSQUITTO_USER, password: MOSQUITTO_PASSWD});
client.on("error",(error: string) => { console.log("Can't connect"+error); });
client.on("connect",() => {	console.log("connected to MQTT port"); });

client.subscribe("testtopic", {qos:1});
client.subscribe("finish_hang_event", {qos:1});
client.on('message', (topic: string, message: string, packet: any) => {
  console.log("message is " + packet.payload.toString('utf-8'));
  console.log("topic is " + topic);
  saveMQTTPacket(packet);
});

