import { describe, it, expect } from "vitest";
import { tap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** tap — identity passthrough with side-effects on every edge (docs/09, A). */
describe("tap — Mealy machine STT", () => {
  // Row 1: values pass through unchanged while the side-effect runs
  it("Row 1: passes values through unchanged and runs next side-effect", () => {
    const s = makeScheduler();
    const seen: number[] = [];
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(tap((v) => seen.push(v)));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
    expect(seen).toEqual([1, 2]);
  });

  // Terminal edges: tap observes complete
  it("observes the complete notification", () => {
    const s = makeScheduler();
    let completed = false;
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     -a|";
      const result = source.pipe(tap({ complete: () => (completed = true) }));
      expectObservable(result).toBe(expected, { a: 1 });
    });
    expect(completed).toBe(true);
  });

  // Terminal edges: tap observes error, and the error still propagates
  it("observes the error notification and still forwards it", () => {
    const s = makeScheduler();
    let errored: unknown = null;
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(tap({ error: (e) => (errored = e) }));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
    expect((errored as Error).message).toBe("boom");
  });
});
