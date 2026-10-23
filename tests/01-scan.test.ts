import { describe, it } from "vitest";
import { scan } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `scan`.
 * Each test maps to a row of the State Transition Table (STT) in
 * docs/01-scan.md.
 */
describe("scan — Mealy machine STT", () => {
  // Row 1: Running(acc,i) --next(v)--> Running(f(acc,v,i), i+1) / emit(f(...))
  it("Row 1: emits the running accumulation on every next", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-y-z|";
      const result = source.pipe(scan((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, { x: 1, y: 3, z: 6 });
    });
  });

  // Row 1 (guard-free): index is threaded through the accumulator
  it("Row 1: threads the index argument (i) into the accumulator", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 10, b: 20, c: 30 });
      const expected = "     -x-y-z|";
      // Emit "value*index" so we can observe i = 0,1,2
      const result = source.pipe(scan((_acc, v, i) => v * i, 0));
      expectObservable(result).toBe(expected, { x: 0, y: 20, z: 60 });
    });
  });

  // Row 2: Running --complete--> Done / complete
  it("Row 2: forwards completion after the final emission", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 1 });
      const expected = "     -x-y|";
      const result = source.pipe(scan((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, { x: 1, y: 2 });
    });
  });

  // Row 2 (edge): empty source completes with no emission
  it("Row 2 (edge): empty source completes without emitting", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(scan((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 3: Running --error--> Done / error
  it("Row 3: forwards error and stops accumulating", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-#", { a: 1, b: 2 }, new Error("boom"));
      const expected = "     -x-y-#";
      const result = source.pipe(scan((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, { x: 1, y: 3 }, new Error("boom"));
    });
  });

  // Row 4: nothing emitted after termination (no marbles after |)
  it("Row 4: no output after completion (terminal trap)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 5 });
      const expected = "     -x|";
      const result = source.pipe(scan((acc, v) => acc + v, 0));
      expectObservable(result).toBe(expected, { x: 5 });
    });
  });
});
