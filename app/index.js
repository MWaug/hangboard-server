const express = require('express');
const port = 3000;
const hostname = '0.0.0.0';
const mqtt_hostname = '127.0.0.1';
const app = express()

// App
app.get("/", (req, res) => {
  console.log(`Sending`);
  res.send('Hello World');
  console.log(`Done`);
})

app.listen(port, hostname);
console.log(`Server running at http://${hostname}:${port}/`);
console.log(`Done with listening`)
console.log(`Moving onto MQTT`)

// MQTT Connection
var mqtt = require('mqtt');
console.log("Connecting to MQTT server");
var client  = mqtt.connect(`mqtt://${mqtt_hostname}`,{clientId:"index"});
client.on("error",function(error){ console.log("Can't connect"+error); });
client.on("connect",function(){	console.log("connected to MQTT port"); });

// Publish an MQTT announcement every 5 seconds
var message="test message";
var topic="testtopic";
var options={retain:true, qos:1};
//publish function
function publish(topic,msg,options){
  console.log("publishing",msg);
  if (client.connected == true){
    client.publish(topic,msg,options);
  }
}
//publish every 5 secs
var timer_id = setInterval(function() {publish(topic,message,options);}, 5000);

// Subscribe to my own topic
client.subscribe("testtopic", {qos:1});
client.on('message', function(topic, message, packet) {
  console.log("message is " + message);
  console.log("topic is " + topic);
});
