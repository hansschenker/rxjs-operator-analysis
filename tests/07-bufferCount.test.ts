import { describe, it } from "vitest";
import { bufferCount } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `bufferCount(n)` (single-arg form).
 * Each test maps to a row of the STT in docs/07-bufferCount.md.
 */
describe("bufferCount — Mealy machine STT", () => {
  // Rows 1 + 2: fill buffer to n, flush on the n-th value, reset.
  it("Rows 1+2: emits a buffer of n and resets (modulo boundary)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // n = 2: [a,b] flushed on b; [c,d] flushed on d.
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const expected = "     ---x---y|";
      const result = source.pipe(bufferCount(2));
      expectObservable(result).toBe(expected, { x: [1, 2], y: [3, 4] });
    });
  });

  // Row 3: partial buffer flushed on completion.
  it("Row 3: partial buffer flushed on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // n = 2 but 3 values: [a,b] flushed on b@3, then [c] partial flushed on
      // complete@6. Frames: -a-b-c| => a@1,b@3,c@5,complete@6.
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ---x--(y|)";
      const result = source.pipe(bufferCount(2));
      expectObservable(result).toBe(expected, { x: [1, 2], y: [3] });
    });
  });

  // Row 3 (edge): empty source completes emitting a single empty buffer? No —
  // RxJS emits nothing for an empty source. Verify completion with no output.
  it("Row 3 (edge): empty source completes with no buffer", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(bufferCount(2));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 2 (exact multiple): no trailing partial buffer when count divides evenly.
  it("Row 2 (exact multiple): no empty trailing buffer", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // Frames: -a-b| => a@1, b@3, complete@4. Buffer [a,b] flushes AT THE
      // BOUNDARY value b@3 (Row 2), then the source completes @4 — the flush is
      // NOT deferred to completion. (Oracle-confirmed.)
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ---x|";
      const result = source.pipe(bufferCount(2));
      expectObservable(result).toBe(expected, { x: [1, 2] });
    });
  });

  // Row 4: error forwarded, buffered values dropped.
  it("Row 4: error forwarded, partial buffer dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(bufferCount(2));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });

  // n = 1 degenerate case: every value is its own buffer (always at boundary).
  it("n=1: every value flushes immediately as a singleton buffer", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -x-y|";
      const result = source.pipe(bufferCount(1));
      expectObservable(result).toBe(expected, { x: [1], y: [2] });
    });
  });
});
