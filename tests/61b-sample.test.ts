import { describe, it } from "vitest";
import { sample } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** sample — snapshot the latest value when a notifier emits (docs/operators/sample.md, B). */
describe("sample — Mealy machine STT", () => {
  // sample(notifier): emit latest whenever the notifier emits
  it("emits latest on each notifier emission", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b-c-d|", { a: "a", b: "b", c: "c", d: "d" });
      const notifier = cold("---x---|", { x: true });
      // notifier emits @3; latest source value then is b (b@2). emit b@3.
      const expected = "     ---x---|";
      const result = source.pipe(sample(notifier));
      expectObservable(result).toBe(expected, { x: "b" });
    });
  });

  // Row 3: a tick with no fresh value is a no-op (not re-emitted)
  it("Row 3: a tick with no new value emits nothing", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a------|", { a: "a" });
      const notifier = cold("--x-x--|", { x: true });
      // first notifier tick @2 emits a; second tick @4 has no new value => noop.
      const expected = "     --x----|";
      const result = source.pipe(sample(notifier));
      expectObservable(result).toBe(expected, { x: "a" });
    });
  });
});
