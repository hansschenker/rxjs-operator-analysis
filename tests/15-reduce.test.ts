import { describe, it } from "vitest";
import { reduce } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** reduce — accumulate silently, emit once on complete (docs/09, Sub-family B). */
describe("reduce — Mealy machine STT", () => {
  // Rows 1 + 2: intermediate values are silent; single final emission on complete
  it("Rows 1+2: emits only the final accumulation on complete", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------(x|)"; // emit at the complete frame
      const result = source.pipe(reduce((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, { x: 6 });
    });
  });

  // Row 2 (seed, empty source): emits the seed
  it("Row 2: with a seed, an empty source emits the seed", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(reduce((acc, v) => acc + v, 100));
      expectObservable(result).toBe(expected, { x: 100 });
    });
  });

  // Row 3 (seedless, empty source): completes with NO emission (does not throw)
  it("Row 3: seedless over an empty source completes with no value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(reduce((acc: number, v: number) => acc + v));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 4: error forwarded, no final emission
  it("Row 4: error forwarded, no final emission", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(reduce((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
