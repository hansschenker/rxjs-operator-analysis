import { describe, it } from "vitest";
import { throttleTime } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `throttleTime` (default config
 * { leading: true, trailing: false }).
 * Each test maps to a row of the State Transition Table (STT) in
 * docs/04-throttleTime.md.
 *
 * Time is an input symbol: `tick` = the virtual clock reaching the end of the
 * throttle window. We use d = 30ms.
 */
const D = 30;

describe("throttleTime — Mealy machine STT (leading:true, trailing:false)", () => {
  // Row 1: Open --next(v)--> Throttled / emit(v)  (leading edge)
  it("Row 1: first value passes immediately (leading edge)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a|", { a: 1 });
      const expected = "     a|";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 2: Throttled --next(w)--> Throttled / noop  (dropped inside window)
  it("Row 2: values inside the window are dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a at 0 (emits, window 0..30). b at 10, c at 20 both dropped.
      const source = cold("  a---------b---------c|", { a: 1, b: 2, c: 3 });
      const expected = "     a--------------------|";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Rows 3 + 1: after the window closes, the next value emits again.
  it("Rows 3+1: after window closes, the next value emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a at 0 emits; window 0..30. b arrives at frame 40 (> 30) => Open => emits.
      const source = cold("  a 39ms b|", { a: 1, b: 2 });
      const expected = "     a 39ms b|";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 4: Open --complete--> Done / complete
  it("Row 4: completion forwarded from Open state", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 5: Throttled --complete--> Done / complete
  it("Row 5: completion forwarded while throttled", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a emits at 0, still inside window at complete (frame 2).
      const source = cold("  a-|", { a: 1 });
      const expected = "     a-|";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 6: any --error(e)--> Done / error(e)
  it("Row 6: error forwarded", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-#", { a: 1 }, new Error("boom"));
      const expected = "     a-#";
      const result = source.pipe(throttleTime(D));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
