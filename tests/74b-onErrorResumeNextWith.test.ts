import { describe, it } from "vitest";
import { onErrorResumeNextWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** onErrorResumeNextWith — error treated as complete (docs/operators/onErrorResumeNextWith.md, A). */
describe("onErrorResumeNextWith — error treated as complete", () => {
  // Row 3: an error advances to the next source (error swallowed).
  it("Row 3: swallows the error and moves to the next source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const next = cold("b|", { b: "b" });
      // a@0, error@2 treated like complete => b@2, complete@3.
      const expected = "   a-b|";
      const result = source.pipe(onErrorResumeNextWith(next));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });
});
