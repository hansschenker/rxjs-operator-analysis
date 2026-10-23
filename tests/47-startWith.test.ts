import { describe, it } from "vitest";
import { startWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** startWith — prepend values on subscribe (docs/11, Sub-family D). */
describe("startWith — Mealy machine STT", () => {
  // Row 0 + 1: a single prepended value emits at frame 0, then source flows
  // unshifted. (A single-value prepend keeps the group one frame wide so the
  // source's own frames line up cleanly in marble syntax.)
  it("Rows 0+1: prepends a value before the source (unshifted source)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      // x@0, then source: a@1, b@3, complete@4.
      const expected = "     xa-b|";
      const result = source.pipe(startWith(10));
      expectObservable(result).toBe(expected, { x: 10, a: 1, b: 2 });
    });
  });

  // Multi-value prepend: both emit synchronously at frame 0 (verified by frame).
  it("Rows 0+1: multiple prepended values all emit synchronously at frame 0", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // Empty source so the only output is the synchronous prepend group.
      const source = cold("|");
      const expected = "     (xy|)";
      const result = source.pipe(startWith(10, 20));
      expectObservable(result).toBe(expected, { x: 10, y: 20 });
    });
  });

  // Prepend even for an empty source
  it("prepends values even when the source is empty", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     x--|";
      const result = source.pipe(startWith(99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Row 3: error forwarded (after the prepended values)
  it("Row 3: forwards source error after prepending", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -#", undefined, new Error("boom"));
      const expected = "     x#";
      const result = source.pipe(startWith(99));
      expectObservable(result).toBe(expected, { x: 99 }, new Error("boom"));
    });
  });
});
