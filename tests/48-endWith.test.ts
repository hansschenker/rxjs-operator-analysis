import { describe, it } from "vitest";
import { endWith } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** endWith — append values on source completion (docs/11, Sub-family D). */
describe("endWith — Mealy machine STT", () => {
  // Rows 1 + 2: source flows, appended values emit on completion
  it("Rows 1+2: appends values on source completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      // after source completes @4, append x,y synchronously then complete.
      const expected = "     -a-b(xy|)";
      const result = source.pipe(endWith(10, 20));
      expectObservable(result).toBe(expected, { a: 1, b: 2, x: 10, y: 20 });
    });
  });

  // Append onto an empty source
  it("appends values onto an empty source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---(x|)";
      const result = source.pipe(endWith(99));
      expectObservable(result).toBe(expected, { x: 99 });
    });
  });

  // Row 3: errored source skips the appended tail entirely
  it("Row 3: an errored source skips the appended values", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(endWith(99));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
