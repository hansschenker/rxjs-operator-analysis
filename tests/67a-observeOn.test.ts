import { describe, it } from "vitest";
import { observeOn, asyncScheduler } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** observeOn — identity value machine; re-schedules outgoing notifications (docs/operators/observeOn.md, H). */
describe("observeOn — scheduling (identity value machine)", () => {
  // observeOn(asyncScheduler): re-schedules each notification.
  it("values are identical, each shifted onto the scheduler", () => {
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
});
