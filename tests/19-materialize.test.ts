import { describe, it } from "vitest";
import { materialize } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** materialize — reify Σ notifications as Notification values (docs/09, D). */
describe("materialize — Mealy machine STT", () => {
  // Row 1 + 2: next values become 'N' notifications; complete becomes a 'C'
  // notification emitted as next, then the output completes.
  it("Rows 1+2: wraps next values and completion into Notification objects", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      // Output: N(1)@1, N(2)@3, then C-notification + complete @4.
      const expected = "     -x-y(z|)";
      const result = source.pipe(materialize());
      expectObservable(result).toBe(expected, {
        x: { kind: "N", value: 1, error: undefined, hasValue: true },
        y: { kind: "N", value: 2, error: undefined, hasValue: true },
        z: { kind: "C", value: undefined, error: undefined, hasValue: false },
      });
    });
  });

  // Row 3: a SOURCE ERROR becomes an 'E' notification and the output COMPLETES
  // (it does NOT error downstream) — the striking edge.
  it("Row 3: source error is reified and the output completes normally", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const err = new Error("boom");
      const source = cold("  -a-#", { a: 1 }, err);
      const expected = "     -x-(y|)";
      const result = source.pipe(materialize());
      expectObservable(result).toBe(expected, {
        x: { kind: "N", value: 1, error: undefined, hasValue: true },
        y: { kind: "E", value: undefined, error: err, hasValue: false },
      });
    });
  });
});
