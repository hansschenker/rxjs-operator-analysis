import { describe, it } from "vitest";
import { retryWhen, take } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** retryWhen — notifier-driven retry loop (docs/operators/retryWhen.md, B). */
describe("retryWhen — notifier-driven loop", () => {
  // resubscribe when the notifier emits (bounded here by take).
  it("resubscribes when the notifier emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      // The error notifier is capped with take(1): on the first error it emits
      // then completes, which completes the whole stream. Oracle: a@0, C@2.
      const result = source.pipe(retryWhen((errs) => errs.pipe(take(1))));
      expectObservable(result).toBe("a-|", { a: "a" });
    });
  });
});
