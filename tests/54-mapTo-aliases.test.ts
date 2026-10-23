import { describe, it } from "vitest";
import { mergeMapTo, concatMapTo, switchMapTo } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * The *MapTo operators map every outer value to the SAME fixed inner:
 *   mergeMapTo(inner)  = mergeMap(() => inner)
 *   concatMapTo(inner) = concatMap(() => inner)
 *   switchMapTo(inner) = switchMap(() => inner)
 * (All deprecated in favor of the () => inner form, but still present in 7.x.)
 */
describe("*MapTo aliases — fixed-inner projection", () => {
  it("mergeMapTo: each outer value starts the same inner (interleaved)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold(" ab|", { a: 1, b: 2 });
      const inner = cold(" x-y|", { x: "i0", y: "i1" });
      // a@0 -> inner(i0@0,i1@2); b@1 -> inner(i0@1,i1@3); interleave.
      const result = outer.pipe(mergeMapTo(inner));
      expectObservable(result).toBe("pqrs|", {
        p: "i0",
        q: "i0",
        r: "i1",
        s: "i1",
      });
    });
  });

  it("concatMapTo: same inner, queued in order", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold(" ab|", { a: 1, b: 2 });
      const inner = cold(" x-y|", { x: "i0", y: "i1" });
      const result = outer.pipe(concatMapTo(inner));
      expectObservable(result).toBe("p-qr-s|", {
        p: "i0",
        q: "i1",
        r: "i0",
        s: "i1",
      });
    });
  });

  it("switchMapTo: same inner, latest wins", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold(" ab|", { a: 1, b: 2 });
      const inner = cold(" x-y|", { x: "i0", y: "i1" });
      const result = outer.pipe(switchMapTo(inner));
      expectObservable(result).toBe("pq-r|", { p: "i0", q: "i0", r: "i1" });
    });
  });
});
