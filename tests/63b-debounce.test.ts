import { describe, it } from "vitest";
import { debounce, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** debounce — quiet-period selector generalization (docs/operators/debounce.md, D). */
describe("debounce — Mealy machine STT (quiet period)", () => {
  // debounce: emit latest only after a quiet gap of the duration.
  it("emits the latest value after a quiet period", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // burst a,b,c within <20ms collapses; emit last (c) 20ms after c.
      const source = cold("  a-b-c 25ms |", { a: "a", b: "b", c: "c" });
      // c@4; quiet 20ms => emit c@24; source completes @30.
      const expected = "     24ms c 5ms |";
      const result = source.pipe(debounce(() => timer(20)));
      expectObservable(result).toBe(expected, { c: "c" });
    });
  });
});
