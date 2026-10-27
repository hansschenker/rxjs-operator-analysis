import { describe, it } from "vitest";
import { zipWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * zipWith(...others) = zip(source, ...others) in pipeable form. Same
 * per-source-queue machine (docs/operators/zipWith.md).
 */
describe("zipWith — Mealy machine STT (per-source queue, pipeable)", () => {
  // Row 2: pairs by index, the faster source buffers ahead.
  it("Row 2: pairs by index, buffering the faster source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a--b--c|", { a: "a", b: "b", c: "c" });
      const b = cold("    -x-y|", { x: "x", y: "y" });
      const result = a.pipe(zipWith(b));
      expectObservable(result).toBe("-p-q|", {
        p: ["a", "x"],
        q: ["b", "y"],
      });
    });
  });
});
