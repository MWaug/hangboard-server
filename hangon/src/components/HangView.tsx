import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";

import {
  FinishHangEventMqttType,
  StartHangEventMqttType,
  WeightEventMqttType,
} from "../shared/utils";
import { hangonMqttConnect, hangonSetMqttMessageHandler } from "../libraries/hangonMqtt";
import {
  hangStarted,
  hangFinished,
  weightReceived,
} from "../shared/store/hangboardSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";

hangonMqttConnect();

export default function HangView() {
  const dispatch = useAppDispatch();

  hangonSetMqttMessageHandler((msg: FinishHangEventMqttType) => {
    // console.log(msg);
    dispatch(hangFinished(msg));
  },
  (msg: StartHangEventMqttType) => {
    console.log(msg);
    dispatch(hangStarted(msg));
  },
  (msg: WeightEventMqttType) => {
    dispatch(weightReceived(msg));
  })

  const duration = useAppSelector(
    (state: RootState) => state.entities.hangboard.duration
  );

  return (
    <View style={styles.container}>
      <View style={{...styles.bar, height: MAX_BAR_HEIGHT * (duration/MAX_DURATION)}}></View>
      <View>
        <Text >Duration: {duration/1000}</Text>
      </View>
      <View style={styles.navBar}>
        <View><Text>Back</Text></View>
        <View><Text>Forward</Text></View>
      </View>
    </View>
  );
}

const MAX_BAR_HEIGHT = 500;
const MAX_DURATION = 20000;

const computeBarHeight = (duration: number, max: number) => {}

const styles = StyleSheet.create({
  bar: {
    width: 100,
    backgroundColor: "dodgerblue"
  },
  navBar: {
    height: 50,
    backgroundColor: "yellowgreen",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignContent: "center",
  },
})