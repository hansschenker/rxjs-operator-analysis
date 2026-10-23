import { describe, it } from "vitest";
import { pluck } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** pluck — map over a (possibly nested) key path (docs/09, Sub-family A). */
describe("pluck — Mealy machine STT", () => {
  // Row 1: single-level key extraction
  it("Row 1: extracts a top-level property", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: { id: 1 }, b: { id: 2 } });
      const expected = "     -x-y|";
      const result = source.pipe(pluck("id"));
      expectObservable(result).toBe(expected, { x: 1, y: 2 });
    });
  });

  // Row 1: nested key path
  it("Row 1: walks a nested key path", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: { p: { q: 7 } } });
      const expected = "     -x|";
      const result = source.pipe(pluck("p", "q"));
      expectObservable(result).toBe(expected, { x: 7 });
    });
  });

  // Row 1: missing property resolves to undefined
  it("Row 1: missing property yields undefined", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: { other: 1 } });
      const expected = "     -x|";
      const result = source.pipe(pluck("missing"));
      expectObservable(result).toBe(expected, { x: undefined });
    });
  });
});
