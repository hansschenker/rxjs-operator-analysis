import { describe, it, expect } from "vitest";
import { catchError, onErrorResumeNextWith, finalize, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** Error-recovery cluster: catchError / onErrorResumeNextWith / finalize. */
describe("catchError — Mealy machine STT (error recovery)", () => {
  // Row 3-5: on error, swap to the selector's observable.
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

describe("onErrorResumeNextWith — error treated as complete", () => {
  // Row 3: an error advances to the next source (error swallowed).
  it("Row 3: swallows the error and moves to the next source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const next = cold("b|", { b: "b" });
      // a@0, error@2 treated like complete => b@2, complete@3.
      const expected = "   a-b|";
      const result = source.pipe(onErrorResumeNextWith(next));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });
});

describe("finalize — teardown edge", () => {
  // Rows 2 & 3: callback fires on complete AND on error.
  it("runs the callback on completion", () => {
    const s = makeScheduler();
    let called = false;
    s.run(({ cold, expectObservable }) => {
      const source = cold("a|", { a: "a" });
      const result = source.pipe(finalize(() => (called = true)));
      expectObservable(result).toBe("a|", { a: "a" });
    });
    expect(called).toBe(true);
  });

  it("runs the callback on error", () => {
    const s = makeScheduler();
    let called = false;
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const result = source.pipe(finalize(() => (called = true)));
      expectObservable(result).toBe("a-#", { a: "a" }, new Error("x"));
    });
    expect(called).toBe(true);
  });
});
