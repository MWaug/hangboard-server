import { recordsFromMQTTPacket, saveHangEvent, saveMQTTPacket } from "./db";
import { makeTimeSeriesRecords } from "./time_series.model";
import mqttPacket from "mqtt-packet";
import { HangEventType } from "./hang_event.model";

const weightFunction = (
  startTimeMs: number,
  endTimeMs: number,
  aveWeight: number,
  sampleTime: number
): number => {
  const duration = endTimeMs - startTimeMs;
  const riseEnd = startTimeMs + duration * 0.1;
  const fallStart = startTimeMs + duration * 0.9;

  // Rising edge
  if (sampleTime < riseEnd) {
    const slope = (aveWeight - 0) / (riseEnd - startTimeMs);
    const offset = 0;
    return slope * (sampleTime - startTimeMs) + offset;
  }

  // Constant force
  if (sampleTime > riseEnd && sampleTime < fallStart) {
    return aveWeight + Math.random() * aveWeight * 0.1;
  }

  // Falling edge
  const slope = (0 - aveWeight) / (endTimeMs - fallStart);
  const offset = aveWeight;
  return slope * (sampleTime - fallStart) + offset;
};

const generateHangEvent = (
  startTimeMs: number,
  maxHangMs: number,
  samplesPerSecond: number,
  aveWeight: number
): HangEventType => {
  const endTimeMs = startTimeMs + Math.random() * maxHangMs;
  const duration = endTimeMs - startTimeMs;
  const nSamples = Math.floor(duration * (samplesPerSecond / 1000.0));
  var weight: number[] = [];
  var times: number[] = [];

  for (var i = 0; i < nSamples; i++) {
    times.push(startTimeMs + i * (1000 / samplesPerSecond));
  }
  for (var i = 0; i < nSamples; i++) {
    weight.push(weightFunction(startTimeMs, endTimeMs, aveWeight, times[i]));
  }

  const average = (array: number[]) => array.reduce((a: number, b: number) => a + b) / array.length;
  const max = (array: number[]) => array.reduce((a: number, b: number) => (a > b ? a : b));

  return {
    maxWeight: max(weight),
    aveWeight: average(weight),
    device: "48:3F:DA:7D:C5:53",
    recvTime: new Date(),
    startTimeMs: startTimeMs,
    endTimeMs: endTimeMs,
    curTimeMs: endTimeMs + 10,
    user: "exampleUser",
    weight: weight,
    times: times,
    meta: { exampleData: true },
  };
};

test("Generate example User data", async () => {
  var startTimeMs = 1000;
  for (var i = 0; i < 15; i++) {
    const exampleHang = generateHangEvent(startTimeMs + 20000 * i, 10000, 10, 180);
    saveHangEvent(exampleHang);
  }
});

test("Save finish hang event", async () => {
  const exampleFinishPayload = {
    max_weight: 2,
    ave_weight: 190,
    device_id: "48:3F:DA:7D:C5:52",
    start_hang_ms: 1000,
    end_hang_ms: 2000,
    cur_time_ms: 2010,
    times: [1000, 1100],
    weight: [170, 190],
    meta: {},
  };
  const payloadStr: string = JSON.stringify(exampleFinishPayload);
  const packet: mqttPacket.IPublishPacket = {
    cmd: "publish",
    messageId: 42,
    qos: 2,
    dup: false,
    topic: "finish_hang_event",
    payload: Buffer.from(payloadStr),
    retain: false,
    properties: {
      // optional properties MQTT 5.0
      payloadFormatIndicator: true,
      messageExpiryInterval: 4321,
      topicAlias: 100,
      responseTopic: "topic",
      correlationData: Buffer.from([1, 2, 3, 4]),
      userProperties: {
        test: "test",
      },
      subscriptionIdentifier: 120, // can be an Array in message from broker, if message included in few another subscriptions
      contentType: "test",
    },
  };
  await saveMQTTPacket(packet);
});

test("invalid series record throws exception", () => {
  expect(() => makeTimeSeriesRecords([1, 2, 4], [1], 1)).toThrow(
    "t[3] and v[1] are different lengths"
  );
});

test("create time series records", () => {
  expect(makeTimeSeriesRecords([1, 1.5, 3, 4, 5], [10, 15, 30, 40, 50], 3)).toStrictEqual([
    { startTime: 1, meta: {}, t: [1, 1.5, 3], v: [10, 15, 30] },
    { startTime: 4, meta: {}, t: [4, 5], v: [40, 50] },
  ]);
  expect(makeTimeSeriesRecords([1, 1.5, 3, 4, 5], [10, 15, 30, 40, 50], 5)).toStrictEqual([
    { startTime: 1, meta: {}, t: [1, 1.5, 3, 4, 5], v: [10, 15, 30, 40, 50] },
  ]);
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1)).toStrictEqual([
    { startTime: 11, meta: {}, t: [11], v: [22] },
    { startTime: 13, meta: {}, t: [13], v: [33] },
  ]);
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1, { size: "32mm" })).toStrictEqual([
    { startTime: 11, t: [11], v: [22], meta: { size: "32mm" } },
    { startTime: 13, t: [13], v: [33], meta: { size: "32mm" } },
  ]);
});

test("records from mqtt packet", async () => {
  const payloadStr: string = JSON.stringify({
    t: [1, 1.5, 3],
    v: [10, 15, 30],
  });
  const pobj: mqttPacket.IPublishPacket = {
    cmd: "publish",
    messageId: 42,
    qos: 2,
    dup: false,
    topic: "test",
    payload: Buffer.from(payloadStr),
    retain: false,
    properties: {
      // optional properties MQTT 5.0
      payloadFormatIndicator: true,
      messageExpiryInterval: 4321,
      topicAlias: 100,
      responseTopic: "topic",
      correlationData: Buffer.from([1, 2, 3, 4]),
      userProperties: {
        test: "test",
      },
      subscriptionIdentifier: 120, // can be an Array in message from broker, if message included in few another subscriptions
      contentType: "test",
    },
  };
  expect(recordsFromMQTTPacket(pobj)).toStrictEqual([
    { startTime: 1, t: [1], v: [10], meta: {} },
    { startTime: 1.5, t: [1.5], v: [15], meta: {} },
    { startTime: 3, t: [3], v: [30], meta: {} },
  ]);
  const invalidPacket: mqttPacket.IPublishPacket = {
    cmd: "publish",
    qos: 2,
    retain: false,
    dup: false,
    topic: "test",
    messageId: 101,
    payload: Buffer.from(JSON.stringify({ apple: "isgood", nonTSfield: "blah" })),
  };
  expect(recordsFromMQTTPacket(invalidPacket)).toStrictEqual([]);
});
