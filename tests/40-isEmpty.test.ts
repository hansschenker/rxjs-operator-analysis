import { describe, it } from "vitest";
import { isEmpty } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** isEmpty — 1-bit existence check (docs/11, Sub-family B). */
describe("isEmpty — Mealy machine STT", () => {
  // Row 1: first value short-circuits to false
  it("Row 1: short-circuits to false on the first value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  --a--b|", { a: 1, b: 2 });
      const expected = "     --(x|)"; // false emitted at first value's frame (2)
      const result = source.pipe(isEmpty());
      expectObservable(result).toBe(expected, { x: false });
    });
  });

  // Row 2: empty source -> true on completion
  it("Row 2: emits true for an empty source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(isEmpty());
      expectObservable(result).toBe(expected, { x: true });
    });
  });

  // Row 3: error forwarded
  it("Row 3: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---#", undefined, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(isEmpty());
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
