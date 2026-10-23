import { describe, it } from "vitest";
import { take } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** take(n) — the canonical counter (docs/10, Sub-family A). */
describe("take — Mealy machine STT", () => {
  // Rows 1 + 2: emit first n, self-complete on the n-th value
  it("Rows 1+2: emits first n values then self-completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // take(2): emit a@1, then b@3 emits AND completes (source never reaches c)
      const expected = "     -a-(b|)";
      const result = source.pipe(take(2));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 2 (self-complete): take(1) completes on the first value
  it("Row 2: take(1) emits and completes on the first value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -(a|)";
      const result = source.pipe(take(1));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Boundary n=0: emit nothing, complete immediately
  it("Boundary n=0: completes immediately with no emission", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     |";
      const result = source.pipe(take(0));
      expectObservable(result).toBe(expected);
    });
  });

  // Boundary n > length: behaves like identity, Row 3 completion
  it("Boundary n>length: passes all values then forwards completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(take(5));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 4: error forwarded before reaching n
  it("Row 4: forwards error before the count is reached", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(take(5));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
