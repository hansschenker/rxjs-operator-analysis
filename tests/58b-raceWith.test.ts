import { describe, it } from "vitest";
import { raceWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * raceWith(...others) = race(source, ...others) in pipeable form. Same
 * winner-lock machine (docs/operators/raceWith.md).
 */
describe("raceWith — Mealy machine STT (winner-lock, pipeable)", () => {
  // Row 1+3: the source emits first and wins; the other is dropped.
  it("Row 1+3: source wins the race, the other is dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    -a-b|", { a: "a", b: "b" }); // emits first @1
      const b = cold("    --x-y|", { x: "x", y: "y" });
      const result = a.pipe(raceWith(b));
      expectObservable(result).toBe("-p-q|", { p: "a", q: "b" });
    });
  });
});
