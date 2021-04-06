import React, { useState } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

import * as color from "../app/colors";
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
import AppText from "./AppText";
import BigText from "./BigText";

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
    (state: RootState) => state.entities.hangboard.plotData
  );

  const chartConfig = {
    // backgroundGradientFrom: color.primary,
    backgroundGradientFromOpacity: 0,
    // backgroundGradientTo: color.secondary,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(115, 89, 73, ${opacity})`,
    strokeWidth: 2, // optional, default 3
    barPercentage: 0.5,
    useShadowColorFromDataset: false, // optional
  };

  return (
    <View
      style={{
        ...styles.container,
      }}
    >
      <View
        style={{
          flex: -1,
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "flex-end",
        }}
      >
        <LineChart
          data={{
            labels: (recordedWeight.length === 0) ? [0] : Array(recordedWeight.length).fill(" "),
            datasets: [
              {
                data: (recordedWeight.length === 0) ? [0] : recordedWeight,
                color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
              },
            ],
          }}
          width={Dimensions.get("window").width}
          height={220}
          chartConfig={chartConfig}
        ></LineChart>
      </View>
      <View style={styles.statsBar}>
        <BigText>{(duration / 1000).toFixed(1)}s</BigText>
        <BigText>{maxWeight + "lbs"}</BigText>
      </View>
      <View style={styles.navBar}>
        <View>
          <AppText>Back</AppText>
        </View>
        <View>
          <AppText>Forward</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    height: 50,
    backgroundColor: color.darker,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignContent: "center",
    backgroundColor: color.lighter,
  },
  statsBar: {
    backgroundColor: color.primary,
    alignItems: "center",
    justifyContent: "space-evenly",
    flexDirection: "row",
  },
});
