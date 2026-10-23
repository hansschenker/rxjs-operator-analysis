import { describe, it } from "vitest";
import { single, EmptyError, SequenceError, NotFoundError } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** single — the 4-outcome existence machine (docs/10, Sub-family D). */
describe("single — Mealy machine STT (4 outcomes)", () => {
  // Outcome 1 (Row 4): exactly one match -> emit it on complete
  it("exactly one value: emits it on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     --(a|)";
      const result = source.pipe(single());
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Outcome 1 with predicate: exactly one match
  it("exactly one match for the predicate: emits it", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------(b|)";
      const result = source.pipe(single((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { b: 2 });
    });
  });

  // Outcome 2 (Row 2): more than one match -> SequenceError (early, on 2nd match)
  it("more than one match: errors with SequenceError", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      // second value triggers SequenceError immediately at frame 3
      const expected = "     ---#";
      const result = source.pipe(single());
      expectObservable(result).toBe(expected, undefined, new SequenceError("Too many matching values"));
    });
  });

  // Outcome 3 (Row 5): non-empty but no match -> NotFoundError on complete
  it("no match in a non-empty source: errors with NotFoundError", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 3 });
      const expected = "     ----#";
      const result = source.pipe(single((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, undefined, new NotFoundError("No matching values"));
    });
  });

  // Outcome 4 (Row 6): empty source -> EmptyError on complete
  it("empty source: errors with EmptyError", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---#";
      const result = source.pipe(single());
      expectObservable(result).toBe(expected, undefined, new EmptyError());
    });
  });
});
