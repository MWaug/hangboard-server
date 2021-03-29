import React, { useState, Fragment } from 'react';
import logo from './logo.svg';
import './App.css';
import mqtt from 'mqtt';
import { MOSQUITTO_USER, MOSQUITTO_PASSWD } from './app_secrets'

const mqttHostname = '192.168.0.21'; // Name of the docker service in compose

let client: mqtt.MqttClient = mqtt.connect(
  { host: mqttHostname, port: 9001, clientId: "app", username: MOSQUITTO_USER, password: MOSQUITTO_PASSWD });
client.subscribe("finish_hang_event", { qos: 1 });
client.subscribe("start_hang_event", { qos: 1 });
client.subscribe("weight", { qos: 1 });
client.on('error', (err) => {
  console.error('Connection error: ', err);
  client.end();
})

let isHanging: boolean = false;

// function 
function App() {
  let note: String = "";
  client.on('message', function (topic, message) {
    let obj = JSON.parse(message.toString());
    if (topic === "start_hang_event") {
      console.log(message.toString());
      note = "Starting Hang"
      isHanging = true;
      setMesg(note);
    }
    if (topic === "finish_hang_event") {
      console.log(message.toString());
      note = "Finished Hang " + (obj["end_hang_ms"] - obj["start_hang_ms"]) / 1000
      isHanging = false;
      setMesg(note);
    }
    if (topic === "weight") {
      setWeight(obj["weight"]);
    }
  });
  const [mesg, setMesg] = useState<JSX.Element | String>(<Fragment><em>nothing yet</em></Fragment>);
  const [weight, setWeight] = useState<Number>(0);
  // const [mesg, setMesg] = useState<JSX.Element | String>(<Fragment><em>nothing yet</em></Fragment>);

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Hangboard WebApp!
        </p>
        <p>
          {mesg}
        </p>
        <p>{weight} lbs</p>
      </header>
    </div>
  );
}

export default App;
