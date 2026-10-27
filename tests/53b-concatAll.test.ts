import { describe, it } from "vitest";
import { concatAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * concatAll — flattens by subscribing to inners one at a time, in order
 * (merge policy with concurrency 1 ⇒ a queue). concatAll() = mergeAll(1).
 * STT skeleton (concat policy) in docs/operators/concatAll.md.
 */
describe("concatAll — Mealy machine STT (concat policy, identity projection)", () => {
  // M1/M2/M3: second inner is queued until the first completes; output ordered
  it("M1-M3: concatenates inner observables in order", () => {
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
});
