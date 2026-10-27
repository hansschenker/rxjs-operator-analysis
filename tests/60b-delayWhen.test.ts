import { describe, it } from "vitest";
import { delayWhen, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** delayWhen — per-value dynamic time-shift (docs/operators/delayWhen.md, Sub-family A). */
describe("delayWhen — Mealy machine STT", () => {
  // per-value duration observable controls the delay
  it("delays each value by its duration observable", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      // a@0 -> @20, b@2 -> @22. delayWhen delays each value, and completion
      // resolves once the last pending delay fires — so b and complete land
      // together @22 (the completion is NOT further delayed). Oracle-confirmed.
      const expected = "     20ms a 1ms (b|)";
      const result = source.pipe(delayWhen(() => timer(20)));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });
});
