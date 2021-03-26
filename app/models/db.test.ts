import { MongTSType, saveTS, getTS, makeTimeSeriesRecords, recordsFromMQTTPacket, saveMQTTPacket } from "./db";
import mqttPacket from "mqtt-packet";

test('database connects and saves', async () => {

  const exampleTS = {startTime:1, t: [1], v: [10], meta: {}};
  saveTS(exampleTS);
  const ts: MongTSType | null = await getTS(1);
  expect(ts).toBeTruthy();

  if(ts) {
    expect(Array.from(ts.t)).toStrictEqual([1]);
    expect(Array.from(ts.v)).toStrictEqual([10]);
  }

  const exampleTS2 = {startTime:2, t: [2], v: [20], meta: {}};
  const payloadStr: string = JSON.stringify( exampleTS2 );
  const packet: mqttPacket.IPublishPacket = {
    cmd: 'publish',
    messageId: 42,
    qos: 2,
    dup: false,
    topic: 'test',
    payload: Buffer.from(payloadStr),
    retain: false,
    properties: { // optional properties MQTT 5.0
        payloadFormatIndicator: true,
        messageExpiryInterval: 4321,
        topicAlias: 100,
        responseTopic: 'topic',
        correlationData: Buffer.from([1, 2, 3, 4]),
        userProperties: {
          'test': 'test'
        },
        subscriptionIdentifier: 120, // can be an Array in message from broker, if message included in few another subscriptions
        contentType: 'test'
     }
  }
  saveMQTTPacket(packet);
});

test('create time series records', async () => {
  expect(makeTimeSeriesRecords([1,1.5,3,4,5], [10,15,30,40,50], 3)).toStrictEqual(
    [{startTime: 1, meta: {}, t:[1,1.5,3], v:[10,15,30]}, {startTime: 4, meta: {}, t:[4,5], v:[40, 50]}]
  )
  expect(makeTimeSeriesRecords([1,1.5,3,4,5], [10,15,30,40,50], 5)).toStrictEqual(
    [{startTime: 1, meta: {}, t: [1,1.5,3,4,5], v: [10,15,30,40,50]}]
  )
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1)).toStrictEqual(
    [{startTime: 11, meta: {}, t: [11], v: [22]}, {startTime: 13, meta: {}, t: [13], v: [33]}]
  )
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1, {size: "32mm"})).toStrictEqual(
    [{startTime: 11, t: [11], v: [22], meta: {size: "32mm"}}, {startTime: 13, t: [13], v: [33], meta: {size: "32mm"}}]
  )
})

test('records from mqtt packet', async() => {
  const payloadStr: string = JSON.stringify({
    t:[1, 1.5, 3],
    v:[10, 15, 30]
  })
  const pobj: mqttPacket.IPublishPacket = {
    cmd: 'publish',
    messageId: 42,
    qos: 2,
    dup: false,
    topic: 'test',
    payload: Buffer.from(payloadStr),
    retain: false,
    properties: { // optional properties MQTT 5.0
        payloadFormatIndicator: true,
        messageExpiryInterval: 4321,
        topicAlias: 100,
        responseTopic: 'topic',
        correlationData: Buffer.from([1, 2, 3, 4]),
        userProperties: {
          'test': 'test'
        },
        subscriptionIdentifier: 120, // can be an Array in message from broker, if message included in few another subscriptions
        contentType: 'test'
     }
  }
  expect(recordsFromMQTTPacket(pobj)).toStrictEqual(
    [ {startTime: 1, t:[1], v:[10], meta: {}},
      {startTime: 1.5, t:[1.5], v:[15], meta: {}},
      {startTime: 3, t:[3], v:[30], meta: {}} ]
  )
})
