import { describe, it } from "vitest";
import { mergeAll, concatAll, switchAll, exhaustAll, exhaust } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * The *All operators flatten a higher-order Observable (source of Observables).
 * They are the identity-projection specialisations:
 *   mergeAll()   = mergeMap(identity)
 *   concatAll()  = mergeAll(1)
 *   switchAll()  = switchMap(identity)
 *   exhaustAll() = exhaustMap(identity)   (exhaust is a deprecated alias)
 * Same source/inner shapes as the *Map tests so the policies line up (docs/12).
 */
describe("*All aliases — identity-projection flattening", () => {
  // mergeAll interleaves the inner observables
  it("mergeAll: interleaves inner observables", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(mergeAll());
      expectObservable(result).toBe("pqrs|", {
        p: "a0",
        q: "b0",
        r: "a1",
        s: "b1",
      });
    });
  });

  // concatAll queues them in order
  it("concatAll: concatenates inner observables in order", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(concatAll());
      expectObservable(result).toBe("p-qr-s|", {
        p: "a0",
        q: "a1",
        r: "b0",
        s: "b1",
      });
    });
  });

  // switchAll keeps only the latest inner
  it("switchAll: switches to the latest inner", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(switchAll());
      expectObservable(result).toBe("pq-r|", { p: "a0", q: "b0", r: "b1" });
    });
  });

  // exhaustAll (and exhaust) ignore new inners while one is active
  it("exhaustAll: ignores new inners while one is active", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(exhaustAll());
      expectObservable(result).toBe("p-q|", { p: "a0", q: "a1" });
    });
  });

  it("exhaust: deprecated alias behaves like exhaustAll", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(exhaust());
      expectObservable(result).toBe("p-q|", { p: "a0", q: "a1" });
    });
  });
});
