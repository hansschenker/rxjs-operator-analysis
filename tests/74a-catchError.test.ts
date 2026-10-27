import { describe, it } from "vitest";
import { catchError, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** catchError — error recovery by swapping to a fallback (docs/operators/catchError.md, A). */
describe("catchError — Mealy machine STT (error recovery)", () => {
  // Rows 3-5: on error, swap to the selector's observable.
  it("Rows 3-5: swaps to the fallback observable on error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const fallback = cold("b|", { b: "b" });
      // a@0, error@2 consumed => fallback subscribed @2: b@2, complete@3.
      const expected = "   a-b|";
      const result = source.pipe(catchError(() => fallback));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });

  // Row 2: no error => passes through, selector never runs.
  it("Row 2: without an error the fallback is never used", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-|", { a: "a" });
      const result = source.pipe(catchError(() => of("fallback")));
      expectObservable(result).toBe("a-|", { a: "a" });
    });
  });
});
