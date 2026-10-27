import { describe, it } from "vitest";
import { timeout, TimeoutError, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** timeout — watchdog FSM (docs/operators/timeout.md, Sub-family G). */
describe("timeout — Mealy machine STT (watchdog)", () => {
  // Row 1: values arriving in time reset the watchdog and pass through.
  it("Row 1: values within the deadline pass through, resetting the timer", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // each value < 30ms apart => never times out.
      const source = cold("  a-b-c|", { a: "a", b: "b", c: "c" });
      const expected = "     a-b-c|";
      const result = source.pipe(timeout({ each: 30 }));
      expectObservable(result).toBe(expected, { a: "a", b: "b", c: "c" });
    });
  });

  // Row 2: no value within the deadline => TimeoutError.
  it("Row 2: errors with TimeoutError when a value is late", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0, then a 40ms gap (> 30) before b => times out @30.
      const source = cold("  a 40ms b|", { a: "a", b: "b" });
      const expected = "     a 29ms #";
      const result = source.pipe(timeout({ each: 30 }));
      expectObservable(result).toBe(expected, { a: "a" }, new TimeoutError());
    });
  });

  // Row 3: with a fallback observable, switch to it on timeout.
  it("Row 3: switches to a fallback observable on timeout", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a 40ms b|", { a: "a", b: "b" });
      // times out @30, then emits the fallback's value and completes.
      const expected = "     a 29ms (f|)";
      const result = source.pipe(
        timeout({ each: 30, with: () => of("fallback") })
      );
      expectObservable(result).toBe(expected, { a: "a", f: "fallback" });
    });
  });
});
