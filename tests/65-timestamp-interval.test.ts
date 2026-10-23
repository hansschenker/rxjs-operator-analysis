import { describe, it } from "vitest";
import { timestamp, timeInterval } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** timestamp / timeInterval — metadata tagging projectors (docs/14, F). */
describe("timestamp / timeInterval — metadata tagging", () => {
  // timestamp: attaches the absolute scheduler clock time to each value
  it("timestamp: tags each value with the current time", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      const expected = "     x-y|";
      const result = source.pipe(timestamp());
      expectObservable(result).toBe(expected, {
        x: { value: "a", timestamp: 0 },
        y: { value: "b", timestamp: 2 },
      });
    });
  });

  // timeInterval: delta since the previous emission (first is time since subscribe)
  it("timeInterval: reports the gap since the previous value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      const expected = "     x-y|";
      const result = source.pipe(timeInterval());
      expectObservable(result).toBe(expected, {
        x: { value: "a", interval: 0 },
        y: { value: "b", interval: 2 },
      });
    });
  });
});
