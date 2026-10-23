import { describe, it } from "vitest";
import { takeWhile } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** takeWhile(p, inclusive?) — predicate-gated prefix (docs/10, Sub-family B). */
describe("takeWhile — Mealy machine STT", () => {
  // Rows 1 + 2: emit while predicate holds; complete (exclusive) on first failure
  it("Rows 1+2: emits while predicate holds, completes on first failure", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // take while v < 3: a(1)@1, b(2)@3 pass; c(3)@5 FAILS the predicate =>
      // complete at c's frame (5). Unlike take(n), takeWhile can't self-complete
      // on the last emitted value — it must SEE the failing value first, so the
      // completion lands on c's frame, separate from b's emission. (Oracle.)
      const expected = "     -a-b-|";
      const result = source.pipe(takeWhile((v) => v < 3));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 3: inclusive=true emits the failing value before completing
  it("Row 3: inclusive=true emits the boundary value then completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // inclusive: c(3) is emitted, THEN complete
      const expected = "     -a-b-(c|)";
      const result = source.pipe(takeWhile((v) => v < 3, true));
      expectObservable(result).toBe(expected, { a: 1, b: 2, c: 3 });
    });
  });

  // Row 1 (all pass): predicate always true -> identity
  it("Row 1: predicate always true forwards all then completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(takeWhile(() => true));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 5: error forwarded
  it("Row 5: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(takeWhile((v) => v < 3));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
