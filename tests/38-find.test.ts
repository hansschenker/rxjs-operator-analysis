import { describe, it } from "vitest";
import { find } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** find — existential quantifier, short-circuits on first match (docs/11, B). */
describe("find — Mealy machine STT", () => {
  // Row 2: emits the first matching value and completes
  it("Row 2: emits the first matching value and completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // first even: b(2)@3
      const expected = "     ---(x|)";
      const result = source.pipe(find((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 2 });
    });
  });

  // Row 3: no match -> emit undefined on completion
  it("Row 3: emits undefined when no value matches", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 3 });
      const expected = "     ----(x|)";
      const result = source.pipe(find((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: undefined });
    });
  });

  // Row 4: error forwarded
  it("Row 4: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(find((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
