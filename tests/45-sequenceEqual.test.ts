import { describe, it } from "vitest";
import { sequenceEqual } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** sequenceEqual — dual-queue comparison, single boolean on complete (docs/11, C). */
describe("sequenceEqual — Mealy machine STT", () => {
  // Row 4: equal sequences -> emit true on completion
  it("Row 4: emits true for equal sequences", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c|", { a: 1, b: 2, c: 3 });
      const compareTo = cold("-a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "      ------(x|)";
      const result = source.pipe(sequenceEqual(compareTo));
      expectObservable(result).toBe(expected, { x: true });
    });
  });

  // Row 5: different lengths -> false
  it("Row 5: emits false when lengths differ", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c|", { a: 1, b: 2, c: 3 });
      const compareTo = cold("-a-b|", { a: 1, b: 2 });
      // compareTo drains at frame 4; source's extra c@5 exceeds it => the
      // mismatch is decided at frame 5 (short-circuit on the surplus value).
      const expected = "      -----(x|)";
      const result = source.pipe(sequenceEqual(compareTo));
      expectObservable(result).toBe(expected, { x: false });
    });
  });

  // Row 3: value mismatch -> false
  it("Row 3: emits false on a value mismatch", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c|", { a: 1, b: 2, c: 3 });
      const compareTo = cold("-a-b-c|", { a: 1, b: 9, c: 3 });
      // both b's are available at frame 3; cmp(2,9)=false short-circuits there.
      const expected = "      ---(x|)";
      const result = source.pipe(sequenceEqual(compareTo));
      expectObservable(result).toBe(expected, { x: false });
    });
  });

  // Row 6: error forwarded
  it("Row 6: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-#", { a: 1 }, new Error("boom"));
      const compareTo = cold("-a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "      ---#";
      const result = source.pipe(sequenceEqual(compareTo));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
