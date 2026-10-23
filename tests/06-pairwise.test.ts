import { describe, it } from "vitest";
import { pairwise } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `pairwise`.
 * Each test maps to a row of the STT in docs/06-pairwise.md.
 */
describe("pairwise — Mealy machine STT", () => {
  // Rows 1 + 2: first value swallowed, each later value emits [prev, curr].
  it("Rows 1+2: emits overlapping pairs, swallowing the first value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a swallowed; b emits [a,b]; c emits [b,c].
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ---x-y|";
      const result = source.pipe(pairwise());
      expectObservable(result).toBe(expected, { x: [1, 2], y: [2, 3] });
    });
  });

  // Row 3: single value => no pair, just completion (bootstrap never leaves S1 usefully)
  it("Row 3: single-value source completes with no pair", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     --|";
      const result = source.pipe(pairwise());
      expectObservable(result).toBe(expected);
    });
  });

  // Row 1 (edge): empty source completes with no pair (stays in S0)
  it("Row 1 (edge): empty source completes with no output", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(pairwise());
      expectObservable(result).toBe(expected);
    });
  });

  // Row 4: completion forwarded after a pair has been emitted
  it("Row 4: completion forwarded after pairs", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ---x|";
      const result = source.pipe(pairwise());
      expectObservable(result).toBe(expected, { x: [1, 2] });
    });
  });

  // Row 5: error forwarded (here from S1, after the bootstrap value)
  it("Row 5: error forwarded from S1", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-#", { a: 1, b: 2 }, new Error("boom"));
      const expected = "     ---x-#";
      const result = source.pipe(pairwise());
      expectObservable(result).toBe(expected, { x: [1, 2] }, new Error("boom"));
    });
  });
});
