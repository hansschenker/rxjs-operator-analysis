import { describe, it } from "vitest";
import { combineLatestWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * combineLatestWith(...others) = combineLatest(source, ...others) in pipeable
 * form. Same latest-slot machine (docs/operators/combineLatestWith.md).
 */
describe("combineLatestWith — Mealy machine STT (latest-slots, pipeable)", () => {
  // Rows 2+3: wait for both to emit once, then re-emit on ANY change.
  it("Rows 2+3: emits once both have spoken, re-emits on any change", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a--b|", { a: "a", b: "b" });
      const b = cold("    -x--y|", { x: "x", y: "y" });
      const result = a.pipe(combineLatestWith(b));
      expectObservable(result).toBe("-p-qr|", {
        p: ["a", "x"],
        q: ["b", "x"],
        r: ["b", "y"],
      });
    });
  });
});
