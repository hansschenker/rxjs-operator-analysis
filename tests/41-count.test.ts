import { describe, it } from "vitest";
import { count } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** count — reduce that tallies, emits once on complete (docs/11, Sub-family C). */
describe("count — Mealy machine STT", () => {
  // Rows 1 + 2: tally all, emit on complete
  it("Rows 1+2: emits the total count on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------(x|)";
      const result = source.pipe(count());
      expectObservable(result).toBe(expected, { x: 3 });
    });
  });

  // With predicate: count only matches
  it("with a predicate, counts only matching values", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const expected = "     --------(x|)";
      const result = source.pipe(count((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 2 });
    });
  });

  // Empty source -> count 0 (toArray-like: seed 0 always emits)
  it("empty source emits 0", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(count());
      expectObservable(result).toBe(expected, { x: 0 });
    });
  });
});
