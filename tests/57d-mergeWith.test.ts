import { describe, it } from "vitest";
import { mergeWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * mergeWith(...others) = merge(source, ...others) in pipeable form. Same
 * interleave machine (docs/operators/mergeWith.md).
 */
describe("mergeWith — Mealy machine STT (interleave, pipeable)", () => {
  // Row 1: all sources at once, interleaved by time.
  it("Row 1: interleaves values from all sources by time", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a|", { a: "a" });
      const b = cold("    -b-b|", { b: "b" });
      // a@0, b@1, a@2, b@3, complete@4 (both done).
      const result = a.pipe(mergeWith(b));
      expectObservable(result).toBe("xyxy|", { x: "a", y: "b" });
    });
  });
});
