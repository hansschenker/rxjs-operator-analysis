import { describe, it } from "vitest";
import { combineLatestAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * combineLatestAll — two-phase (docs/operators/combineLatestAll.md): Phase 1
 * buffer the inner observables from a higher-order source (noop); Phase 2 on
 * outer complete, run combineLatest over the collected list.
 */
describe("combineLatestAll — higher-order latest-slot flatten", () => {
  it("combines inner observables after the outer completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("   a--b|", { a: "a", b: "b" });
      const ib = cold("   -x--y|", { x: "x", y: "y" });
      const outer = cold("(ab|)", { a: ia, b: ib });
      const result = outer.pipe(combineLatestAll());
      // Same as combineLatest(ia, ib): [a,x]@1, [b,x]@3, [b,y]@4, C@5.
      expectObservable(result).toBe("-p-qr|", {
        p: ["a", "x"],
        q: ["b", "x"],
        r: ["b", "y"],
      });
    });
  });
});
