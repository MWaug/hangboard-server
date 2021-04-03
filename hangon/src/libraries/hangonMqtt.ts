import Paho from "paho-mqtt";

import {
  FinishHangEventMqttType,
  StartHangEventMqttType,
  WeightEventMqttType,
  msgToFinishHangEvent,
  msgToStartHangEvent,
  msgToWeightEvent,
} from "../shared/utils";
import {
  MOSQUITTO_IP,
  MOSQUITTO_PASSWD,
  MOSQUITTO_PORT,
  MOSQUITTO_USER,
} from "../shared/app_secrets";

let client = new Paho.Client(
  MOSQUITTO_IP,
  MOSQUITTO_PORT,
  "/ws",
  "react-native-app"
);

export type hangonMqttHandler = (
  onFinish: (payload: FinishHangEventMqttType) => void,
  onStart: (payload: StartHangEventMqttType) => void,
  onWeight: (payload: WeightEventMqttType) => void
) => void;

export const hangonSetMqttMessageHandler: hangonMqttHandler = (
  onFinish,
  onStart,
  onWeight
) => {
  client.onMessageArrived = (msg) => {
    try {
      switch (msg.destinationName) {
        case "finish_hang_event":
          return onFinish(msgToFinishHangEvent(msg.payloadString));
        case "start_hang_event":
          return onStart(msgToStartHangEvent(msg.payloadString));
        case "weight":
          return onWeight(msgToWeightEvent(msg.payloadString));
        default:
      }
    } catch (e) {
      console.log(`Could not process ${msg}`);
    }
  };
};

export const hangonMqttConnect = () => {
  console.log("Connecting to mqtt server");
  if (client.isConnected()) return;
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
      client.subscribe("start_hang_event", {
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
      client.subscribe("weight", {
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
  });
};
