import { describe, it } from "vitest";
import { mergeScan, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** mergeScan — scan whose accumulator returns an inner Observable (docs/09, C). */
describe("mergeScan — Mealy machine STT", () => {
  // Rows 1+2: each inner emission updates state and is emitted
  it("Rows 1+2: accumulates via inner observables (synchronous inners)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-y-z|";
      // inner = of(acc + v) completes synchronously; running sum 1,3,6
      const result = source.pipe(mergeScan((acc, v) => of(acc + v), 0));
      expectObservable(result).toBe(expected, { x: 1, y: 3, z: 6 });
    });
  });

  // Row 4: completion waits for source and inners (synchronous here)
  it("Row 4: completes after the source (synchronous inners)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 5 });
      const expected = "     -x|";
      const result = source.pipe(mergeScan((acc, v) => of(acc + v), 0));
      expectObservable(result).toBe(expected, { x: 5 });
    });
  });

  // Row 5: error forwarded
  it("Row 5: forwards source error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -x-#";
      const result = source.pipe(mergeScan((acc, v) => of(acc + v), 0));
      expectObservable(result).toBe(expected, { x: 1 }, new Error("boom"));
    });
  });
});
