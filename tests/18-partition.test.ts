import { describe, it } from "vitest";
import { partition } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** partition — two parallel filter machines (docs/09, Sub-family D). */
describe("partition — Mealy machine STT", () => {
  // Rows 1 + 2: each value goes to exactly one of the two output channels
  it("Rows 1+2: routes values to pass/fail by the predicate", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const [evens, odds] = partition(source, (v: number) => v % 2 === 0);
      // Frames: -a-b-c-d| => a@1, b@3, c@5, d@7, complete@8.
      // evens: b(2)@3, d(4)@7 ; odds: a(1)@1, c(3)@5
      expectObservable(evens).toBe("---x---y|", { x: 2, y: 4 });
      expectObservable(odds).toBe("-x---y--|", { x: 1, y: 3 });
    });
  });

  // Rows 3/4: both channels complete together
  it("Rows 3/4: both channels complete together", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const [evens, odds] = partition(source, (v: number) => v % 2 === 0);
      expectObservable(evens).toBe("---x|", { x: 2 });
      expectObservable(odds).toBe("-x--|", { x: 1 });
    });
  });

  // Row 4: both channels error together
  it("Row 4: both channels forward the same error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 2 }, new Error("boom"));
      const [evens, odds] = partition(source, (v: number) => v % 2 === 0);
      expectObservable(evens).toBe("-x-#", { x: 2 }, new Error("boom"));
      expectObservable(odds).toBe("---#", undefined, new Error("boom"));
    });
  });
});
