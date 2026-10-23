import { describe, it } from "vitest";
import { sampleTime, sample } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** sampleTime / sample — snapshot the latest value on tick (docs/14, B). */
describe("sample — Mealy machine STT", () => {
  // Rows 1-3: sampleTime emits the LATEST value at each tick; d = 30.
  it("Rows 1-3: emits the latest value at each timer tick", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0, b@10 (b is latest at first tick @30). first tick emits b.
      const source = cold("  a 9ms b 40ms c|", { a: "a", b: "b", c: "c" });
      // oracle: b@30, complete@52.
      const expected = "     30ms b 21ms |";
      const result = source.pipe(sampleTime(30));
      expectObservable(result).toBe(expected, { b: "b" });
    });
  });

  // sample(notifier): emit latest whenever the notifier emits
  it("sample(notifier): emits latest on each notifier emission", () => {
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
