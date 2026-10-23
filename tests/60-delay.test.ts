import { describe, it } from "vitest";
import { delay, delayWhen, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** delay / delayWhen — fixed/dynamic time-shift (docs/14, Sub-family A). */
describe("delay — Mealy machine STT", () => {
  // Rows 1-3: every value (and completion) shifted by d; d = 30.
  it("Rows 1-3: shifts values and completion by d", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      // a@0 -> @30, b@2 -> @32, complete@3 -> @33.
      const expected = "     30ms a 1ms (b|)";
      const result = source.pipe(delay(30));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });

  // Row 4: errors are NOT delayed — they jump the queue immediately.
  it("Row 4: errors fire immediately (not delayed)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-#", { a: "a" }, new Error("boom"));
      // 'a' would emit @30 but the error @2 arrives first and fires at @2.
      const expected = "     --#";
      const result = source.pipe(delay(30));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });

  // delayWhen: per-value duration observable controls the delay
  it("delayWhen: delays each value by its duration observable", () => {
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
