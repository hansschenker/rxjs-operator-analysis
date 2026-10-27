import { describe, it } from "vitest";
import { switchAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * switchAll — keeps only the latest inner; a new inner cancels the previous.
 * switchAll() = switchMap(identity). STT skeleton (switch policy) in
 * docs/operators/switchAll.md.
 */
describe("switchAll — Mealy machine STT (switch policy, identity projection)", () => {
  // S1: the second inner cancels the first — a1 never emits
  it("S1: switches to the latest inner (cancels the previous)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(switchAll());
      expectObservable(result).toBe("pq-r|", { p: "a0", q: "b0", r: "b1" });
    });
  });
});
