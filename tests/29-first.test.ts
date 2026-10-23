import { describe, it } from "vitest";
import { first, EmptyError } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** first — filter + take(1) + (default | EmptyError) (docs/10, Sub-family D). */
describe("first — Mealy machine STT", () => {
  // Success: first value, self-complete
  it("emits the first value and completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -(a|)";
      const result = source.pipe(first());
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Success with predicate: first MATCHING value
  it("with a predicate, emits the first matching value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ---(b|)";
      const result = source.pipe(first((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { b: 2 });
    });
  });

  // Empty + default: emits the default
  it("empty source with a default emits the default", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(first(undefined, 99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Empty + no default: errors with EmptyError
  it("empty source without a default errors with EmptyError", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---#";
      const result = source.pipe(first());
      expectObservable(result).toBe(expected, undefined, new EmptyError());
    });
  });
});
