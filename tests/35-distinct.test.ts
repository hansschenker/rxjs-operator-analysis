import { describe, it } from "vitest";
import { distinct } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** distinct — global seen-set de-duplication (docs/11, Sub-family A). */
describe("distinct — Mealy machine STT", () => {
  // Rows 1 + 2: emit first occurrence of each value; drop ALL later repeats
  // (unlike distinctUntilChanged, non-consecutive duplicates are also removed).
  it("Rows 1+2: emits only first occurrences (global dedup)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-a-c-b|", { a: 1, b: 2, c: 3 });
      const expected = "     -a-b---c--|";
      const result = source.pipe(distinct());
      expectObservable(result).toBe(expected, { a: 1, b: 2, c: 3 });
    });
  });

  // Row 1: keySelector decides identity
  it("Row 1: keySelector projects the comparison key", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = { id: 1 };
      const b = { id: 1 }; // same key => dropped
      const c = { id: 2 };
      const source = cold("  -a-b-c|", { a, b, c });
      const expected = "     -a---c|";
      const result = source.pipe(distinct((x) => x.id));
      expectObservable(result).toBe(expected, { a, c });
    });
  });

  // Row 3: flushes stream clears the seen-set, allowing a repeat through
  it("Row 3: flushes clears the seen set", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-a-a|", { a: 1 });
      const flushes = cold(" ---f--|", { f: true });
      // a@1 emits; a@3 dropped; flush@3 clears set; a@5 emits again.
      const expected = "     -a---a|";
      const result = source.pipe(distinct(undefined, flushes));
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 5: error forwarded
  it("Row 5: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(distinct());
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
