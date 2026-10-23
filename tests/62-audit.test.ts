import { describe, it } from "vitest";
import { auditTime, audit, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** auditTime / audit — trailing silence window (docs/14, Sub-family C). */
describe("audit — Mealy machine STT (trailing window)", () => {
  // Rows 1-3: auditTime emits the LAST value of each window; d = 30.
  it("Rows 1-3: emits the trailing value of the silence window", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 opens window, b@1 remembered; window closes @30 => emit b.
      // c@43 opens a new window; closes @73 => emit c. (oracle: b@30, c@72)
      const source = cold("  ab 40ms c|", { a: "a", b: "b", c: "c" });
      const expected = "     30ms b 41ms (c|)";
      const result = source.pipe(auditTime(30));
      expectObservable(result).toBe(expected, { b: "b", c: "c" });
    });
  });

  // audit(durationSelector): same trailing behaviour with a dynamic duration
  it("audit: trailing emit with a duration selector", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ab 20ms |", { a: "a", b: "b" });
      // window 20ms from a@0; closes @20 => emit the last value b; complete@22.
      const expected = "     20ms b 1ms |";
      const result = source.pipe(audit(() => timer(20)));
      expectObservable(result).toBe(expected, { b: "b" });
    });
  });
});
