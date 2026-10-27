import { describe, it } from "vitest";
import { auditTime } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** auditTime — trailing silence window on a fixed duration (docs/operators/auditTime.md, C). */
describe("auditTime — Mealy machine STT (trailing window)", () => {
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
});
