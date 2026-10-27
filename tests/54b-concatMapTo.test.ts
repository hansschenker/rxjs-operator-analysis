import { describe, it } from "vitest";
import { concatMapTo } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * concatMapTo(inner) = concatMap(() => inner): same fixed inner, queued in
 * order (concat policy). Deprecated in favor of concatMap(() => inner).
 * STT in docs/operators/concatMapTo.md.
 */
describe("concatMapTo — fixed-inner concat projection", () => {
  // M1-M3 + U1: same inner, started in order one after another
  it("M1-M3/U1: same inner, queued in order", () => {
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
});
