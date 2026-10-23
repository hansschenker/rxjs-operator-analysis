import { describe, it } from "vitest";
import { last, EmptyError } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** last — filter + takeLast(1) + (default | EmptyError) (docs/10, Sub-family D). */
describe("last — Mealy machine STT", () => {
  // Success: last value emitted on completion
  it("emits the last value on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------(c|)";
      const result = source.pipe(last());
      expectObservable(result).toBe(expected, { c: 3 });
    });
  });

  // Success with predicate: last MATCHING value
  it("with a predicate, emits the last matching value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const expected = "     --------(x|)";
      const result = source.pipe(last((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 4 });
    });
  });

  // Empty + default
  it("empty source with a default emits the default", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(last(undefined, 99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Empty + no default: EmptyError
  it("empty source without a default errors with EmptyError", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---#";
      const result = source.pipe(last());
      expectObservable(result).toBe(expected, undefined, new EmptyError());
    });
  });
});
