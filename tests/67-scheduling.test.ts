import { describe, it } from "vitest";
import { observeOn, subscribeOn, asyncScheduler } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** observeOn / subscribeOn — identity value machines; only re-schedule timing. */
describe("observeOn / subscribeOn — scheduling (identity value machine)", () => {
  // observeOn(asyncScheduler): re-schedules each notification by one frame.
  it("observeOn: values are identical, each shifted onto the scheduler", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      // Within TestScheduler.run(), observeOn(asyncScheduler) re-schedules each
      // notification but adds no virtual-time delay — the value machine is the
      // identity, so frames are unchanged. (Oracle-confirmed.)
      const expected = "     a-b|";
      const result = source.pipe(observeOn(asyncScheduler));
      expectObservable(result).toBe(expected, { a: "a", b: "b" });
    });
  });

  // subscribeOn(asyncScheduler): delays the SUBSCRIPTION by one frame.
  it("subscribeOn: subscription scheduled, values otherwise identical", () => {
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
