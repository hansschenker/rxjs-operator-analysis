import { describe, it } from "vitest";
import { merge } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** merge — interleave, all sources at once (docs/operators/merge.md, Strategy C). */
describe("merge — Mealy machine STT (interleave)", () => {
  // Rows 3/4: completes only when ALL sources complete.
  it("Rows 3/4: completes only after every source completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a|", { a: "a" });
      const b = cold("    b---|", { b: "b" });
      const result = merge(a, b);
      // a@0, b@0 (synchronous group); b completes @4. The group (xy) advances
      // the marble cursor by its full character count (4), so (xy)| places the
      // completion at frame 4.
      expectObservable(result).toBe("(xy)|", { x: "a", y: "b" });
    });
  });
});
