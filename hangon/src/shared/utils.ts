// MQTT Message types

export type StartHangEventMqttType = {
  startTime: number;
  device: String;
  meta: {};
};

export type FinishHangEventMqttType = {
  startTime: number;
  endTime: number;
  maxWeight: number;
  aveWeight: number;
  device: String;
  t: number[];
  weight: number[];
  meta: {};
};

export type WeightEventMqttType = {
  weight: number;
  device: String;
  time: number;
};

// MQTT Messaging helper functions

export const msgToFinishHangEvent = (
  payload: string
): FinishHangEventMqttType => {
  const json = JSON.parse(payload);
  return {
    startTime: json["start_hang_ms"] as number,
    endTime: json["end_hang_ms"] as number,
    maxWeight: json["max_weight"] as number,
    aveWeight: json["ave_weight"] as number,
    device: json["device_id"] as string,
    t: [],
    weight: [],
    meta: {},
  };
};

export const msgToStartHangEvent = (
  payload: string
): StartHangEventMqttType => {
  const json = JSON.parse(payload);
  return {
    startTime: json["start_hang_ms"] as number,
    device: json["device_id"] as string,
    meta: {},
  };
};

export const msgToWeightEvent = (payload: string): WeightEventMqttType => {
  const json = JSON.parse(payload);
  return {
    weight: json["weight"] as number,
    device: json["device_id"] as string,
    time: json["cur_time_ms"] as number,
  };
};

export function computeWeight(offset: number): number {
  return offset;
}
