import { describe, it } from "vitest";
import { mergeAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * mergeAll — flattens a higher-order Observable by subscribing to every inner
 * immediately; emissions interleave by time. mergeAll() = mergeMap(identity).
 * STT skeleton (merge policy) in docs/operators/mergeAll.md.
 */
describe("mergeAll — Mealy machine STT (merge policy, identity projection)", () => {
  // U1 + M1: both inners run concurrently, outputs interleave by time
  it("U1/M1: interleaves inner observables", () => {
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

  // U4: completes only after outer AND all inners complete
  it("U4: completes after the last inner finishes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x|", { x: "a0" });
      const outer = cold(" a|", { a: ia });
      const result = outer.pipe(mergeAll());
      expectObservable(result).toBe("p|", { p: "a0" });
    });
  });
});
