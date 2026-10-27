import { describe, it } from "vitest";
import { exhaustAll } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * exhaustAll — ignores new inners while one is active (first wins until it
 * finishes). exhaustAll() = exhaustMap(identity). STT skeleton (exhaust policy)
 * in docs/operators/exhaustAll.md.
 */
describe("exhaustAll — Mealy machine STT (exhaust policy, identity projection)", () => {
  // E2: the second inner is dropped while the first is still active
  it("E2: ignores new inners while one is active", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const ia = cold("    x-y|", { x: "a0", y: "a1" });
      const ib = cold("    x-y|", { x: "b0", y: "b1" });
      const outer = cold(" ab|", { a: ia, b: ib });
      const result = outer.pipe(exhaustAll());
      expectObservable(result).toBe("p-q|", { p: "a0", q: "a1" });
    });
  });
});
