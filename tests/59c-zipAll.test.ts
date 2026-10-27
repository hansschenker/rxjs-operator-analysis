import { describe, it } from "vitest";
import { zipAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * zipAll — two-phase (docs/operators/zipAll.md): Phase 1 buffer the inner
 * observables from a higher-order source (noop); Phase 2 on outer complete,
 * run zip (index pairing) over the collected list.
 */
describe("zipAll — higher-order per-queue flatten", () => {
  it("zips inner observables after the outer completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("   a--b--c|", { a: "a", b: "b", c: "c" });
      const ib = cold("   -x-y|", { x: "x", y: "y" });
      const outer = cold("(ab|)", { a: ia, b: ib });
      const result = outer.pipe(zipAll());
      expectObservable(result).toBe("-p-q|", {
        p: ["a", "x"],
        q: ["b", "y"],
      });
    });
  });
});
