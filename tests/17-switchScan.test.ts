import { describe, it } from "vitest";
import { switchScan, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** switchScan — scan + switch semantics on inner observables (docs/09, C). */
describe("switchScan — Mealy machine STT", () => {
  // Rows 1+2: with synchronous inners it behaves like scan (no switch races)
  it("Rows 1+2: accumulates via switched inner observables", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-y-z|";
      const result = source.pipe(switchScan((acc, v) => of(acc + v), 0));
      expectObservable(result).toBe(expected, { x: 1, y: 3, z: 6 });
    });
  });

  // Row 1 (switch): a new source value cancels the previous (slow) inner.
  it("Row 1 (switch): new source value cancels the previous pending inner", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@1 starts an inner that would emit at +30ms (frame 31); b@3 switches
      // away before it fires, so a's inner is cancelled; b's inner (also +30ms)
      // emits at frame 33. Only b's accumulation survives.
      const source = cold("  -a-b|", { a: 10, b: 20 });
      const inner = (acc: number, v: number) =>
        cold("30ms (r|)", { r: acc + v });
      // b@3 starts its inner; inner emits 30ms later => frame 33, then completes.
      const expected = "     3ms 30ms (r|)";
      const result = source.pipe(switchScan(inner, 0));
      // a's inner cancelled; b runs on seed 0 (switchScan threads last EMITTED
      // state; since a never emitted, acc is still 0) => 0 + 20 = 20.
      expectObservable(result).toBe(expected, { r: 20 });
    });
  });

  // Row 5: error forwarded
  it("Row 5: forwards source error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -x-#";
      const result = source.pipe(switchScan((acc, v) => of(acc + v), 0));
      expectObservable(result).toBe(expected, { x: 1 }, new Error("boom"));
    });
  });
});
