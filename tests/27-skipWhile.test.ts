import { describe, it } from "vitest";
import { skipWhile } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** skipWhile(p) — one-way latch from Skipping to Passing (docs/10, Sub-family B). */
describe("skipWhile — Mealy machine STT", () => {
  // Rows 1 + 2 + 3: skip while predicate holds, then pass everything (latch)
  it("Rows 1-3: skips while predicate holds, then passes all (incl. re-matches)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 1 });
      // skip while v < 3: a(1),b(2) skipped; c(3) opens the gate; d(1) STILL
      // passes because the latch is one-way (predicate not re-checked).
      const expected = "     -----c-d|";
      const result = source.pipe(skipWhile((v) => v < 3));
      expectObservable(result).toBe(expected, { c: 3, d: 1 });
    });
  });

  // Row 2 (immediate open): first value fails predicate -> pass everything
  it("Row 2: if the first value fails the predicate, pass everything", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 5, b: 6 });
      const expected = "     -a-b|";
      const result = source.pipe(skipWhile((v) => v < 3));
      expectObservable(result).toBe(expected, { a: 5, b: 6 });
    });
  });

  // Row 5: error forwarded while still skipping
  it("Row 5: forwards error while skipping", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(skipWhile((v) => v < 3));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
