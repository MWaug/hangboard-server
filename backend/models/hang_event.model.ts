export type HangEventType = {
  recvTime: Date;
  startTimeMs: number;
  curTimeMs: number;
  endTimeMs: number;
  maxWeight: number;
  aveWeight: number;
  user: String;
  device: String;
  times: number[];
  weight: number[];
  meta: {};
};
