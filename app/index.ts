import express from "express";
import mqtt from "mqtt";
import { dbConnects } from "./models/db";
const port = 3000;
const hostname = '0.0.0.0';
// const mqttHostname = '127.0.0.1';
const mqttHostname = 'broker';  // Name of the docker service in compose
const app = express()

// App
app.get("/", (_req: any, res) => {
  console.log(`Sending`);
  res.send('Hello World');
  console.log(`Done`);
})

app.listen(port, hostname);
console.log(`Server running at http://${hostname}:${port}/`);
console.log(`Done with listening`)
console.log(`Moving onto MQTT`)

// MQTT Connection
console.log("Connecting to MQTT server");
const client  = mqtt.connect(`mqtt://${mqttHostname}`,{clientId:"index"});
client.on("error",(error: string) => { /* console.log("Can't connect"+error); */ });
client.on("connect",() => {	console.log("connected to MQTT port"); });

// Subscribe to my own topic
client.subscribe("testtopic", {qos:1});
client.on('message', (topic: string, message: string, _packet: any) => {
  console.log("message is " + message);
  console.log("topic is " + topic);
});

