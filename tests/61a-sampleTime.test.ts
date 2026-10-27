import { describe, it } from "vitest";
import { sampleTime } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** sampleTime — snapshot the latest value on a timer tick (docs/operators/sampleTime.md, B). */
describe("sampleTime — Mealy machine STT", () => {
  // Rows 1-3: sampleTime emits the LATEST value at each tick; d = 30.
  it("Rows 1-3: emits the latest value at each timer tick", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0, b@10 (b is latest at first tick @30). first tick emits b.
      const source = cold("  a 9ms b 40ms c|", { a: "a", b: "b", c: "c" });
      // oracle: b@30, complete@52.
      const expected = "     30ms b 21ms |";
      const result = source.pipe(sampleTime(30));
      expectObservable(result).toBe(expected, { b: "b" });
    });
  });
});
