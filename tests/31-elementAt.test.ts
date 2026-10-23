import { describe, it } from "vitest";
import { elementAt, ArgumentOutOfRangeError } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** elementAt(i, default?) — index selection (docs/10, Sub-family D). */
describe("elementAt — Mealy machine STT", () => {
  // Success: value at index i, self-complete
  it("emits the value at the given index and completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ---(b|)"; // index 1 => b, completes on b
      const result = source.pipe(elementAt(1));
      expectObservable(result).toBe(expected, { b: 2 });
    });
  });

  // Out of range + default
  it("index out of range with a default emits the default", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ----(x|)";
      const result = source.pipe(elementAt(5, 99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Out of range + no default: ArgumentOutOfRangeError
  it("index out of range without a default errors", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ----#";
      const result = source.pipe(elementAt(5));
      expectObservable(result).toBe(
        expected,
        undefined,
        new ArgumentOutOfRangeError()
      );
    });
  });
});
