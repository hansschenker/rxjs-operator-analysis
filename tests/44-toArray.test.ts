import { describe, it } from "vitest";
import { toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** toArray — collect all into an array, emit on complete (docs/11, Sub-family C). */
describe("toArray — Mealy machine STT", () => {
  // Rows 1 + 2: collect, emit the array on completion
  it("Rows 1+2: collects all values and emits the array on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------(x|)";
      const result = source.pipe(toArray());
      expectObservable(result).toBe(expected, { x: [1, 2, 3] });
    });
  });

  // Empty source -> emits [] (seed [] ALWAYS emits — contrast with max/min)
  it("empty source emits an empty array (seeded)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(toArray());
      expectObservable(result).toBe(expected, { x: [] });
    });
  });

  // Row 3: error forwarded, no array emitted
  it("Row 3: forwards error without emitting", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(toArray());
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
