import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  StartHangEventMqttType,
  FinishHangEventMqttType,
  WeightEventMqttType,
} from "../utils";

interface HangboardState {
  inHang: boolean;
  weight: number;
  duration: number;
  hangStart: number;
  hangEnd: number;
  hangData: number[];
}

const initialState: HangboardState = {
  inHang: false,
  weight: 0,
  duration: 0,
  hangStart: 0,
  hangEnd: 0,
  hangData: [],
};

const slice = createSlice({
  name: "hangboard",
  initialState,
  reducers: {
    hangStarted: (state, action: PayloadAction<StartHangEventMqttType>) => {
      state.inHang = true;
      state.hangStart = action.payload.startTime;
      state.hangData = [];
    },
    hangFinished: (state, action: PayloadAction<FinishHangEventMqttType>) => {
      state.inHang = false;
      state.hangEnd = action.payload.endTime;
      if (state.hangStart !== 0) {
        state.duration = action.payload.endTime - action.payload.startTime;
      }
    },
    weightReceived: (state, action: PayloadAction<WeightEventMqttType>) => {
      state.weight = action.payload.weight;
      if (state.inHang) {
        state.duration = action.payload.time - state.hangStart;
        state.hangData = [...state.hangData, action.payload.weight];
      }
    },
  },
});

export const { hangStarted, hangFinished, weightReceived } = slice.actions;
export default slice.reducer;
