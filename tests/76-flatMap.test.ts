import { describe, it, expect } from "vitest";
import { flatMap, mergeMap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** flatMap — deprecated rename of mergeMap (docs/16, Alias). */
describe("flatMap — alias of mergeMap", () => {
  // flatMap is literally `export const flatMap = mergeMap`.
  it("is the same function reference as mergeMap", () => {
    expect(flatMap).toBe(mergeMap);
  });

  // Behaves identically to mergeMap (merge-policy flatten).
  it("flattens inners concurrently just like mergeMap", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      const result = outer.pipe(flatMap(inner));
      // identical to the mergeMap interleave test (tests/49).
      expectObservable(result).toBe("pqrs|", {
        p: "a0",
        q: "b0",
        r: "a1",
        s: "b1",
      });
    });
  });
});
