import { describe, it } from "vitest";
import { mergeMapTo } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * mergeMapTo(inner) = mergeMap(() => inner): every outer value starts the SAME
 * fixed inner; emissions interleave (merge policy). Deprecated in favor of
 * mergeMap(() => inner). STT in docs/operators/mergeMapTo.md.
 */
describe("mergeMapTo — fixed-inner merge projection", () => {
  // M1 + U1: each outer value starts the same inner; interleaved by time
  it("M1/U1: each outer value starts the same inner (interleaved)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold(" ab|", { a: 1, b: 2 });
      const inner = cold(" x-y|", { x: "i0", y: "i1" });
      const result = outer.pipe(mergeMapTo(inner));
      expectObservable(result).toBe("pqrs|", {
        p: "i0",
        q: "i0",
        r: "i1",
        s: "i1",
      });
    });
  });
});
