import { describe, it } from "vitest";
import { repeatWhen, take } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** repeatWhen — notifier-driven repeat loop (docs/operators/repeatWhen.md, B). */
describe("repeatWhen — notifier-driven loop", () => {
  // resubscribe when the notifier emits (on complete).
  it("resubscribes when the notifier emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-|", { a: "a" });
      const result = source.pipe(repeatWhen((notes) => notes.pipe(take(1))));
      // a@0, complete@2 -> repeat -> a@2, notifier completes => complete@4.
      expectObservable(result).toBe("a-a-|", { a: "a" });
    });
  });
});
