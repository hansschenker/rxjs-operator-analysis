import { describe, it } from "vitest";
import { findIndex } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** findIndex — like find but emits the index / -1 (docs/11, Sub-family B). */
describe("findIndex — Mealy machine STT", () => {
  // Row 2: emits the index of the first match and completes
  it("Row 2: emits the index of the first matching value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // first even: b at index 1, @3
      const expected = "     ---(x|)";
      const result = source.pipe(findIndex((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 1 });
    });
  });

  // Row 3: no match -> emit -1 on completion
  it("Row 3: emits -1 when no value matches", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 3 });
      const expected = "     ----(x|)";
      const result = source.pipe(findIndex((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: -1 });
    });
  });
});
