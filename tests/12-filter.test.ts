import { describe, it } from "vitest";
import { filter } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** filter — the guarded projector (docs/09, Sub-family A). */
describe("filter — Mealy machine STT", () => {
  // Rows 1 + 2: guard-true emits, guard-false is noop
  it("Rows 1+2: emits values passing the predicate, drops the rest", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const expected = "     ---x---y|"; // keep even numbers: 2, 4
      const result = source.pipe(filter((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 2, y: 4 });
    });
  });

  // Row 1: the index argument i is available to the predicate
  it("Row 1: predicate can use the index", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 9, b: 9, c: 9, d: 9 });
      const expected = "     ---x---y|"; // keep odd indices: 1, 3
      const result = source.pipe(filter((_v, i) => i % 2 === 1));
      expectObservable(result).toBe(expected, { x: 9, y: 9 });
    });
  });

  // Row 2 (all dropped): nothing passes -> only completion
  it("Row 2: when nothing passes, only completion is forwarded", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 3 });
      const expected = "     ----|";
      const result = source.pipe(filter((v) => v % 2 === 0));
      expectObservable(result).toBe(expected);
    });
  });

  // Rows 3/4: terminals forwarded
  it("Rows 3/4: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 2 }, new Error("boom"));
      const expected = "     -x-#";
      const result = source.pipe(filter((v) => v % 2 === 0));
      expectObservable(result).toBe(expected, { x: 2 }, new Error("boom"));
    });
  });
});
