import { describe, it } from "vitest";
import { combineLatestAll, combineAll, zipAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * combineLatestAll / combineAll / zipAll — two-phase machines (docs/13):
 * Phase 1 buffer the inner observables from a higher-order source (noop);
 * Phase 2 on outer complete, run combineLatest / zip over the collected list.
 */
describe("*All combination — higher-order flatten", () => {
  // combineLatestAll: collect inners, then combineLatest them.
  it("combineLatestAll: combines inner observables after outer completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("   a--b|", { a: "a", b: "b" });
      const ib = cold("   -x--y|", { x: "x", y: "y" });
      // higher-order source emits both inners synchronously, then completes.
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

  // combineAll is the deprecated alias of combineLatestAll.
  it("combineAll: deprecated alias behaves like combineLatestAll", () => {
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

  // zipAll: collect inners, then zip them (index pairing).
  it("zipAll: zips inner observables after outer completes", () => {
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
