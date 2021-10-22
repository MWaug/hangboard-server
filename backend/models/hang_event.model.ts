export type HangEventType = {
  recvTime: Date;
  startTime: Date;
  endTime: Date;
  maxWeight: number;
  aveWeight: number;
  user: String;
  device: String;
  times: number[];
  weight: number[];
  meta: {};
};
