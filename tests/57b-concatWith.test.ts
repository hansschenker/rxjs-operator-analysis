import { describe, it } from "vitest";
import { concatWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * concatWith(...others) = concat(source, ...others) in pipeable form. Same
 * sequential machine (docs/operators/concatWith.md).
 */
describe("concatWith — Mealy machine STT (sequential, pipeable)", () => {
  // Rows 1/2: source A fully, THEN source B (ordered, no overlap).
  it("Rows 1/2: forwards A fully, then B in order", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a|", { a: "a" });
      const b = cold("    b-b|", { b: "b" });
      // a@0, a@2, (a completes @3) then b@3, b@5, complete@6.
      const result = a.pipe(concatWith(b));
      expectObservable(result).toBe("x-xy-y|", { x: "a", y: "b" });
    });
  });
});
