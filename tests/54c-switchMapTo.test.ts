import { describe, it } from "vitest";
import { switchMapTo } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * switchMapTo(inner) = switchMap(() => inner): same fixed inner, latest wins
 * (switch policy — a new outer value cancels the running inner). Deprecated in
 * favor of switchMap(() => inner). STT in docs/operators/switchMapTo.md.
 */
describe("switchMapTo — fixed-inner switch projection", () => {
  // S1 + U1: same inner, the second outer value restarts/cancels the first
  it("S1/U1: same inner, latest wins", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold(" ab|", { a: 1, b: 2 });
      const inner = cold(" x-y|", { x: "i0", y: "i1" });
      const result = outer.pipe(switchMapTo(inner));
      expectObservable(result).toBe("pq-r|", { p: "i0", q: "i0", r: "i1" });
    });
  });
});
