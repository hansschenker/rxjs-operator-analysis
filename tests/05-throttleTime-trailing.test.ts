import { describe, it } from "vitest";
import { throttleTime, asyncScheduler } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `throttleTime` with
 * config { leading: true, trailing: true }.
 * Each test maps to a row of the STT in docs/05-throttleTime-trailing.md.
 *
 * d = 30ms. The trailing config remembers the last value seen during the
 * window and emits it when the window closes (the `tick` edge gains an output).
 */
const D = 30;
const CFG = { leading: true, trailing: true } as const;

describe("throttleTime trailing — Mealy machine STT", () => {
  // Row 1: Open --next(v)--> Throttled / emit(v)  (leading still fires)
  it("Row 1: leading value emits immediately", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-|", { a: 1 });
      const expected = "     a-|";
      const result = source.pipe(throttleTime(D, asyncScheduler, CFG));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Rows 1 + 2 + 4: a value during the window is emitted at window close.
  it("Rows 1+2+4: trailing value emitted when the window closes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 emits (leading), window 0..30. b@10 remembered. c@20 remembered.
      // At tick (frame 30) the last remembered value (c) is emitted (trailing).
      // Source completes at 20 + 1 + 60 = frame 81.
      const source = cold("  a---------b---------c 60ms |", {
        a: 1,
        b: 2,
        c: 3,
      });
      // a@0; trailing c@30 (window close); complete@81.
      const expected = "     a 29ms c 50ms |";
      const result = source.pipe(throttleTime(D, asyncScheduler, CFG));
      expectObservable(result).toBe(expected, { a: 1, c: 3 });
    });
  });

  // Row 3: Throttled(∅) --tick--> Open / noop (window with no trailing value)
  it("Row 3: empty window closes silently (no trailing emit)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 emits; no further values before window closes => nothing trailing.
      const source = cold("  a 60ms |", { a: 1 });
      const expected = "     a 60ms |";
      const result = source.pipe(throttleTime(D, asyncScheduler, CFG));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 6: Throttled(last) --complete [last≠∅]--> Done / emit(last), complete
  it("Row 6: completion flushes a pending trailing value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 emits (leading), b@5 remembered, then complete@6 (inside window).
      // IMPORTANT: unlike debounceTime, throttleTime does NOT short-circuit the
      // trailing flush on complete — it waits for the window to close (frame
      // 30), emits the trailing b there, then completes. (Oracle-confirmed.)
      const source = cold("  a----b|", { a: 1, b: 2 });
      const expected = "     a 29ms (b|)";
      const result = source.pipe(throttleTime(D, asyncScheduler, CFG));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 8: error forwarded, pending trailing dropped.
  it("Row 8: error forwarded (trailing dropped)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a----b-#", { a: 1, b: 2 }, new Error("boom"));
      const expected = "     a------#";
      const result = source.pipe(throttleTime(D, asyncScheduler, CFG));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
