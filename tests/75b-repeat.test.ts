import { describe, it } from "vitest";
import { repeat } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** repeat — resubscribe on complete up to count (docs/operators/repeat.md, B). */
describe("repeat — Mealy machine STT (restart on complete)", () => {
  // Rows 1-3: resubscribe on complete up to count, then complete.
  it("Rows 1-3: resubscribes on complete, completing after count", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-|", { a: "a" });
      // repeat(2): a@0, complete@2 -> resubscribe -> a@2, complete@4.
      const expected = "   a-a-|";
      const result = source.pipe(repeat(2));
      expectObservable(result).toBe(expected, { a: "a" });
    });
  });

  // Row 4: an error aborts the repeat loop immediately.
  it("Row 4: an error aborts the repeat loop", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const result = source.pipe(repeat(5));
      expectObservable(result).toBe("a-#", { a: "a" }, new Error("x"));
    });
  });
});
