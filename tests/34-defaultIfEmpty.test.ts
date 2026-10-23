import { describe, it } from "vitest";
import { defaultIfEmpty } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** defaultIfEmpty(d) — one-bit Empty->Seen latch (docs/10, Sub-family D). */
describe("defaultIfEmpty — Mealy machine STT", () => {
  // Row 3: empty source emits the default on completion
  it("Row 3: empty source emits the default then completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(defaultIfEmpty(99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Rows 1 + 2 + 4: non-empty source passes through, default never used
  it("Rows 1+2+4: non-empty source passes through unchanged", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(defaultIfEmpty(99));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 5: error forwarded (default not used)
  it("Row 5: forwards error without using the default", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---#", undefined, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(defaultIfEmpty(99));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
