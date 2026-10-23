import { describe, it } from "vitest";
import { skipLast } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** skipLast(n) — delay-line that drops the final n (docs/10, Sub-family A). */
describe("skipLast — Mealy machine STT", () => {
  // Rows 1 + 2: emit v[i-n] when v[i] arrives; last n never emitted
  it("Rows 1+2: emits all but the last n (delay line)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // skipLast(2): a emitted when c arrives (@5), b emitted when d arrives (@7).
      const expected = "     -----a-b|";
      const result = source.pipe(skipLast(2));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Boundary n=0: identity
  it("Boundary n=0: passes everything immediately", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(skipLast(0));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Boundary n >= length: nothing emitted
  it("Boundary n>=length: emits nothing, completes with source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ----|";
      const result = source.pipe(skipLast(5));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 4: error forwarded
  it("Row 4: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-#", { a: 1, b: 2 }, new Error("boom"));
      const expected = "     -----#";
      const result = source.pipe(skipLast(2));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
