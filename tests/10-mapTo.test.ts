import { describe, it } from "vitest";
import { mapTo } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** mapTo — map with a constant projection (docs/09, Sub-family A). */
describe("mapTo — Mealy machine STT", () => {
  // Row 1: every value becomes the same constant c
  it("Row 1: maps every value to the constant", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-x-x|";
      const result = source.pipe(mapTo("K"));
      expectObservable(result).toBe(expected, { x: "K" });
    });
  });

  // Rows 2/3: terminals forwarded
  it("Rows 2/3: forwards completion and error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -x-#";
      const result = source.pipe(mapTo(42));
      expectObservable(result).toBe(expected, { x: 42 }, new Error("boom"));
    });
  });
});
