import React, { useState, useRef } from "react";
import { View, StyleSheet, Dimensions, Button, SafeAreaView } from "react-native";

import * as color from "../app/colors";
import { chartConfig } from "../components/chartConfig";
import {
  FinishHangEventMqttType,
  StartHangEventMqttType,
  WeightEventMqttType,
} from "../shared/utils";
import {
  hangonMqttConnect,
  hangonSetMqttMessageHandler,
} from "../libraries/hangonMqtt";
import {
  hangStarted,
  hangFinished,
  weightReceived,
} from "../shared/store/hangboardSlice";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { RootState } from "../app/store";
import AppText from "../components/AppText";
import BigText from "../components/BigText";
import { ChartJs, SetData, DataPoint } from "../components/ChartJS";
import symbolicateStackTrace from "react-native/Libraries/Core/Devtools/symbolicateStackTrace";

hangonMqttConnect();

export default function HangView() {
  const dispatch = useAppDispatch();

  hangonSetMqttMessageHandler(
    (msg: FinishHangEventMqttType) => {
      // console.log(msg);
      dispatch(hangFinished(msg));
    },
    (msg: StartHangEventMqttType) => {
      console.log(msg);
      dispatch(hangStarted(msg));
    },
    (msg: WeightEventMqttType) => {
      dispatch(weightReceived(msg));
      if (setDataRef.current) {
        setDataRef.current.setData([
          recordedWeight.map<DataPoint>((value, idx) => {
            return { x: (recordedTime[idx] - hangStart) / 1000, y: value };
          }),
        ]);
      }
    }
  );

  const duration = useAppSelector(
    (state: RootState) => state.entities.hangboard.duration
  );

  const weight = useAppSelector(
    (state: RootState) => state.entities.hangboard.weight
  );

  const inHang = useAppSelector(
    (state: RootState) => state.entities.hangboard.inHang
  );

  const maxWeight = useAppSelector(
    (state: RootState) => state.entities.hangboard.maxWeight
  );

  const recordedWeight = useAppSelector(
    (state: RootState) => state.entities.hangboard.hangData
  );

  const recordedTime = useAppSelector(
    (state: RootState) => state.entities.hangboard.hangTime
  );

  const hangStart = useAppSelector(
    (state: RootState) => state.entities.hangboard.hangStart
  );

  const setDataRef = useRef<SetData>();

  return (
    <SafeAreaView
      style={{
        ...styles.container,
      }}
    >
      <View style={styles.header}>
        <AppText>Live View</AppText>
      </View>
      <View style={styles.body}>
        <View style={styles.graphView}>
          <ChartJs config={chartConfig} ref={setDataRef} />
        </View>
        <View style={styles.statsBar}>
          <BigText>{(duration / 1000).toFixed(1)}s</BigText>
          <BigText>{maxWeight + "lbs"}</BigText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignContent: "center",
    backgroundColor: color.white,
  },
  graphView: {
    height: 200,
    width: "100%",
    alignItems: "center",
  },
  header: {
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: color.grey,
  },
  navBar: {
    height: 50,
    width: "100%",
    backgroundColor: color.white,
    borderTopWidth: 2,
    borderRadius: 4,
    borderTopColor: color.grey,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  statsBar: {
    backgroundColor: color.white,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
});
