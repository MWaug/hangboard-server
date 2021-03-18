import { dbGetOne, makeTimeSeriesRecords } from "./db";

test('database connects', async () => {
  let movie = await dbGetOne("sample_mflix", "movies", {title: "Back to the Future"});
  expect(movie["title"]).toBe("Back to the Future");
});

test('create time series records', async () => {
  expect(makeTimeSeriesRecords([1,1.5,3,4,5], [10,15,30,40,50], 3)).toStrictEqual(
    [{time:[1,1.5,3], value:[10,15,30]}, {time:[4,5], value:[40, 50]}]
  )
  expect(makeTimeSeriesRecords([1,1.5,3,4,5], [10,15,30,40,50], 5)).toStrictEqual(
    [{time: [1,1.5,3,4,5], value: [10,15,30,40,50]}]
  )
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1)).toStrictEqual(
    [{time: [11], value: [22]}, {time: [13], value: [33]}]
  )
  expect(makeTimeSeriesRecords([11, 13], [22, 33], 1, {size: "32mm"})).toStrictEqual(
    [{time: [11], value: [22], size: "32mm"}, {time: [13], value: [33], size: "32mm"}]
  )
})
