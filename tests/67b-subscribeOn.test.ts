import { describe, it } from "vitest";
import { subscribeOn, asyncScheduler } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** subscribeOn — identity value machine; schedules the subscription (docs/operators/subscribeOn.md, H). */
describe("subscribeOn — scheduling (identity value machine)", () => {
  // subscribeOn(asyncScheduler): schedules the SUBSCRIPTION.
  it("subscription scheduled, values otherwise identical", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      // Likewise, subscribeOn(asyncScheduler) schedules the subscription but
      // adds no virtual-time delay here — identity value machine, same frames.
      const expected = "     a-b|";
      const result = source.pipe(subscribeOn(asyncScheduler));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });
});
