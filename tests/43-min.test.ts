import { describe, it } from "vitest";
import { min } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** min — running extreme (minimum), emits on complete (docs/11, Sub-family C). */
describe("min — Mealy machine STT", () => {
  it("Rows 1-4: emits the minimum value on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 3, b: 1, c: 2 });
      const expected = "     ------(x|)";
      const result = source.pipe(min());
      expectObservable(result).toBe(expected, { x: 1 });
    });
  });

  it("Row 5: empty source completes without emitting", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(min());
      expectObservable(result).toBe(expected);
    });
  });
});
