import { describe, it } from "vitest";
import { delay } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** delay — fixed time-shift (docs/operators/delay.md, Sub-family A). */
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
});
