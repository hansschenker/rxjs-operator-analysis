import { describe, it } from "vitest";
import { combineAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * combineAll — deprecated alias of combineLatestAll (identical two-phase
 * machine). docs/operators/combineAll.md.
 */
describe("combineAll — deprecated alias of combineLatestAll", () => {
  it("behaves like combineLatestAll", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("   a--b|", { a: "a", b: "b" });
      const ib = cold("   -x--y|", { x: "x", y: "y" });
      const outer = cold("(ab|)", { a: ia, b: ib });
      const result = outer.pipe(combineAll());
      expectObservable(result).toBe("-p-qr|", {
        p: ["a", "x"],
        q: ["b", "x"],
        r: ["b", "y"],
      });
    });
  });
});
