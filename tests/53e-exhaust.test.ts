import { describe, it } from "vitest";
import { exhaust } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * exhaust — deprecated alias of exhaustAll (identical exhaust-policy machine).
 * STT in docs/operators/exhaust.md.
 */
describe("exhaust — deprecated alias of exhaustAll", () => {
  // E2: behaves identically to exhaustAll — new inner dropped while busy
  it("E2: behaves like exhaustAll (drops new inner while busy)", () => {
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
