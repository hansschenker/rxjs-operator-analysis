import { describe, it } from "vitest";
import { max } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** max — running extreme, emits on complete (docs/11, Sub-family C). */
describe("max — Mealy machine STT", () => {
  // Rows 1-4: emit the maximum on completion
  it("Rows 1-4: emits the maximum value on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 3, b: 1, c: 2 });
      const expected = "     ------(x|)";
      const result = source.pipe(max());
      expectObservable(result).toBe(expected, { x: 3 });
    });
  });

  // Custom comparer
  it("supports a custom comparer", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: "aa", b: "z", c: "bbb" });
      const expected = "     ------(x|)";
      // compare by length: longest wins
      const result = source.pipe(max((p, q) => p.length - q.length));
      expectObservable(result).toBe(expected, { x: "bbb" });
    });
  });

  // Row 5: empty source completes with NO emission (contrast toArray)
  it("Row 5: empty source completes without emitting", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(max());
      expectObservable(result).toBe(expected);
    });
  });
});
