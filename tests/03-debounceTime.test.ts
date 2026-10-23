import { describe, it } from "vitest";
import { debounceTime } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `debounceTime`.
 * Each test maps to a row of the State Transition Table (STT) in
 * docs/03-debounceTime.md.
 *
 * Time is an input symbol here: `tick` corresponds to the virtual clock
 * advancing `d` frames with no new source value. We use d = 20ms.
 *
 * *** Key modelling lesson (discovered by running these tests) ***
 * `debounceTime` has TWO ways to emit a pending value:
 *   (A) Row 3  — the silence timer fires `d` ms after the last value (a "tick").
 *   (B) Row 5  — the SOURCE COMPLETES while a value is pending, which flushes it
 *                immediately at the completion frame (short-circuit).
 * If the source completes BEFORE `d` ms of silence elapses, (B) wins and the
 * natural tick (A) never happens. To exercise Row 3 you must leave a real
 * silent gap of >= d AFTER the last value and BEFORE completion.
 *
 * Marble note: a token like `20ms a` means "advance the clock 20ms, THEN emit
 * a". The space separating the time-progression from the value is significant.
 */
const D = 20;

describe("debounceTime — Mealy machine STT", () => {
  // Rows 1 + 3: Idle --next(v)--> Armed --tick--> Idle / emit(v)
  // 'a'@1, then 25ms of SILENCE so the timer (20ms) fires naturally @21,
  // THEN complete. This isolates the tick edge (A) from the flush-on-complete.
  it("Rows 1+3: single value emits via the silence timer (tick)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a 25ms |", { a: 1 });
      // 'a'@1, emit 20ms later @21. Source completes @27 (1 + 1 + 25).
      const expected = "     1ms 20ms a 5ms |";
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 2: Armed --next(w)--> Armed (restart timer) / noop
  // Burst a,b,c each 5ms apart (< 20) collapses to the last one, c, via tick.
  it("Row 2: burst collapses to only the last value (timer restart)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0, b@5, c@10. Then 25ms silence so c's timer fires @30, then complete.
      const source = cold("  a----b----c 25ms |", { a: 1, b: 2, c: 3 });
      const expected = "     30ms c 5ms |";
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected, { c: 3 });
    });
  });

  // Rows 1+3 twice: two values separated by > d both emit via their own ticks.
  it("Rows 1+3 (x2): two values > d apart both emit", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0; a's timer fires @20. b@30; b's timer fires @50. Silence then complete.
      const source = cold("  a 29ms b 25ms |", { a: 1, b: 2 });
      // a emits @20; b received @30, its timer fires @50; complete @56.
      const expected = "     20ms a 29ms b 5ms |";
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 5: Armed --complete--> Done / emit(v) then complete (flush on complete).
  // THIS is the short-circuit: 'a'@1, complete@2 (< D). The pending 'a' is
  // flushed AT the completion frame (2), not 20ms later. The test runner caught
  // this off-by-one originally — the flush rides on the completion frame.
  it("Row 5: completion flushes the pending value immediately", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     --(a|)"; // flush+complete together at frame 2
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 4: Idle --complete--> Done / complete (empty source, nothing pending)
  it("Row 4: empty source simply completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 6: Armed --error(e)--> Done / error(e) (pending value is dropped)
  it("Row 6: error discards the pending value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // 'a'@1 then error@3, before D elapses: 'a' is NOT emitted.
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(debounceTime(D));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
