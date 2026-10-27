import { describe, it } from "vitest";
import { audit, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** audit — trailing silence window with a duration selector (docs/operators/audit.md, C). */
describe("audit — Mealy machine STT (trailing window)", () => {
  // same trailing behaviour with a dynamic duration
  it("trailing emit with a duration selector", () => {
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
