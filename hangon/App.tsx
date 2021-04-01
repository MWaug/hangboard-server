import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Paho from "paho-mqtt"
import { MOSQUITTO_IP, MOSQUITTO_PASSWD, MOSQUITTO_PORT, MOSQUITTO_USER } from './app_secrets';

// import MqttService from "./src/services/MqttService";
const mqttHostname = '192.168.0.21'; // Name of the docker service in compose
const mqttPort = 9001;

// let isHanging: boolean = false;
//   client.on('message', function (topic, message) {
//     let obj = JSON.parse(message.toString());
//     if (topic === "start_hang_event") {
//       console.log(message.toString());
//       note = "Starting Hang"
//       isHanging = true;
//       setMesg(note);
//     }
//     if (topic === "finish_hang_event") {
//       console.log(message.toString());
//       note = "Finished Hang " + (obj["end_hang_ms"] - obj["start_hang_ms"]) / 1000
//       isHanging = false;
//       setMesg(note);
//     }
//     if (topic === "weight") {
//       setWeight(obj["weight"]);
//     }
//   });

export default function App() {
  
  let client = new Paho.Client(mqttHostname, mqttPort, '/ws', "react-native-app");

  client.connect({
    timeout: 10,
    userName: MOSQUITTO_USER,
    password: MOSQUITTO_PASSWD,
    useSSL: false,
    onSuccess: (o) => {
      console.log("connected: ", o);
      client.subscribe("finish_hang_event", {
        qos: 2,
        invocationContext: { asdf: true },
        onSuccess: (o) => {
            console.log(`subscribed: ${o.invocationContext.asdf}`);
        },
        onFailure: (e) => {
            console.error("error subscribing: ", e.errorMessage);
        },
        timeout: 10,
      });
    },
    mqttVersion: 3,
    onFailure: (e) => {
      console.error("could not connect: ", e.errorMessage);
    },
    hosts: [MOSQUITTO_IP],
    ports: [MOSQUITTO_PORT],
  })

  client.onMessageArrived = (msg) => {
    console.log(`arrived: ${msg.destinationName}: ${msg.payloadString}`);
    console.log(`len: ${msg.payloadBytes.byteLength}, retained: ${msg.retained}, dup: ${msg.duplicate}, qos: ${msg.qos}`);
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
