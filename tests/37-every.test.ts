import { describe, it } from "vitest";
import { every } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** every — universal quantifier, short-circuits on first failure (docs/11, B). */
describe("every — Mealy machine STT", () => {
  // Row 2: first failing value short-circuits to false immediately
  it("Row 2: short-circuits to false on the first failing value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 2, b: 4, c: 5, d: 6 });
      // all-even predicate: c(5)@5 fails => emit false + complete @5
      const expected = "     -----(x|)";
      const result = source.pipe(every((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: false });
    });
  });

  // Row 3: all pass -> emit true on completion
  it("Row 3: emits true on completion when all pass", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 2, b: 4 });
      const expected = "     ----(x|)";
      const result = source.pipe(every((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: true });
    });
  });

  // Row 3 (vacuous): empty source -> true
  it("Row 3 (vacuous): empty source emits true", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(every((v) => v > 0));
      expectObservable(result).toBe(expected, { x: true });
    });
  });

  // Row 4: error forwarded
  it("Row 4: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 2 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(every((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
