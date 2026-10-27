import { describe, it } from "vitest";
import { retry } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** retry — resubscribe on error up to count (docs/operators/retry.md, B). */
describe("retry — Mealy machine STT (restart on error)", () => {
  // Rows 1-4: resubscribe on error up to count, then error out.
  it("Rows 1-4: resubscribes on error, erroring after count exhausted", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      // retry(1): a@0, error@2 -> resubscribe -> a@2, error@4 (exhausted).
      const expected = "   a-a-#";
      const result = source.pipe(retry(1));
      expectObservable(result).toBe(expected, { a: "a" }, new Error("x"));
    });
  });
});
