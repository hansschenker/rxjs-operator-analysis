import { describe, it } from "vitest";
import { withLatestFrom } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `withLatestFrom`.
 * Each test maps to a row of the STT in docs/08-withLatestFrom.md.
 *
 * Two input alphabets: `source` drives emission, `other` contributes its
 * latest value. We use two cold marble streams and align them in time.
 */
describe("withLatestFrom — Mealy machine STT", () => {
  // Row 1: source value before `other` has emitted is dropped.
  it("Row 1: source value before other emits is dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a--b|", { a: 1, b: 2 });
      const other = cold("   -o--|", { o: 10 });
      // a@0 arrives before other (o@1) => dropped. b@3 combines with o => [2,10].
      const expected = "      ---x|";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, { x: [2, 10] });
    });
  });

  // Rows 2 + 4: once other has latched, source values combine with latest other.
  it("Rows 2+4: combines each source value with the latest other", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const other = cold("   o-----|", { o: 10 });
      // other latches o@0. a=>[1,10], b=>[2,10], c=>[3,10].
      const expected = "      -x-y-z|";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, {
        x: [1, 10],
        y: [2, 10],
        z: [3, 10],
      });
    });
  });

  // Row 3: other updating changes which value gets combined next.
  it("Row 3: latest-other updates between source emissions", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a---b|", { a: 1, b: 2 });
      const other = cold("   p--q--|", { p: 10, q: 20 });
      // other: p@0, q@3. a@1 => [1,10]; b@5 (after q@3) => [2,20].
      const expected = "      -x---y|";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, { x: [1, 10], y: [2, 20] });
    });
  });

  // Row 5: source completing completes the output.
  it("Row 5: source completion completes the output", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const other = cold("   o----", { o: 10 }); // other never completes
      const expected = "      -x|";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, { x: [1, 10] });
    });
  });

  // Row 6: other completing does NOT complete the output (asymmetry).
  it("Row 6: other completing does not complete the output", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a--b|", { a: 1, b: 2 });
      const other = cold("   o|", { o: 10 }); // other completes early at frame 1
      // other's latest (10) remains usable after it completes.
      // a=>[1,10], b=>[2,10]; output completes only when SOURCE completes.
      const expected = "      -x--y|";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, { x: [1, 10], y: [2, 10] });
    });
  });

  // Row 8: error on `other` terminates the output.
  it("Row 8: error on other terminates the output", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a---b|", { a: 1, b: 2 });
      const other = cold("   o-#", { o: 10 }, new Error("boom"));
      // other errors @2, before b@5 => output errors @2.
      const expected = "      -x#";
      const result = source.pipe(withLatestFrom(other));
      expectObservable(result).toBe(expected, { x: [1, 10] }, new Error("boom"));
    });
  });
});
