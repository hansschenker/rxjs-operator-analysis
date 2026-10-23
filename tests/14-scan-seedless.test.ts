import { describe, it } from "vitest";
import { scan } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** scan without a seed — bootstrap state (docs/09, Sub-family B). */
describe("scan (seedless) — Mealy machine STT", () => {
  // Row 1: Fresh --next(v)--> Running(v,1) / emit(v)  (first value seeds, emitted)
  it("Row 1: first value seeds the accumulator and is emitted unchanged", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-y-z|";
      // sum without seed: 1, 1+2=3, 3+3=6
      const result = source.pipe(scan((acc, v) => acc + v));
      expectObservable(result).toBe(expected, { x: 1, y: 3, z: 6 });
    });
  });

  // Row 1 edge: single value just emits itself
  it("Row 1 (edge): single value emits itself (never calls accumulator)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 42 });
      const expected = "     -x|";
      const result = source.pipe(scan((acc, v) => acc + v));
      expectObservable(result).toBe(expected, { x: 42 });
    });
  });

  // Rows 3/4: terminals
  it("Rows 3/4: empty source completes with no emission", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(scan((acc, v) => acc + v));
      expectObservable(result).toBe(expected);
    });
  });
});
