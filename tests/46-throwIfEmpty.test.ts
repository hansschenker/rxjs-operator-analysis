import { describe, it } from "vitest";
import { throwIfEmpty, EmptyError } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** throwIfEmpty — error-raising sibling of defaultIfEmpty (docs/11, Sub-family C). */
describe("throwIfEmpty — Mealy machine STT", () => {
  // Non-empty: passes through unchanged, completes normally
  it("non-empty source passes through unchanged", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(throwIfEmpty());
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Empty source + default factory: EmptyError on completion
  it("empty source errors with EmptyError (default factory)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---#";
      const result = source.pipe(throwIfEmpty());
      expectObservable(result).toBe(expected, undefined, new EmptyError());
    });
  });

  // Empty source + custom factory: custom error
  it("empty source errors with a custom error factory", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---#";
      const result = source.pipe(throwIfEmpty(() => new Error("was empty")));
      expectObservable(result).toBe(expected, undefined, new Error("was empty"));
    });
  });
});
