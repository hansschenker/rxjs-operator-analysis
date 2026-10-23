import { describe, it } from "vitest";
import { skip } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** skip(n) — mirror counter (docs/10, Sub-family A). */
describe("skip — Mealy machine STT", () => {
  // Rows 1 + 2 + 3: discard first n, then pass the rest
  it("Rows 1-3: discards the first n values, passes the rest", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const expected = "     -----c-d|"; // skip(2): drop a,b; pass c,d
      const result = source.pipe(skip(2));
      expectObservable(result).toBe(expected, { c: 3, d: 4 });
    });
  });

  // Boundary n=0: identity
  it("Boundary n=0: passes everything", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(skip(0));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Boundary n > length: nothing passes (does NOT self-complete early)
  it("Boundary n>length: emits nothing but completes with the source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ----|";
      const result = source.pipe(skip(5));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 5: error forwarded while still skipping
  it("Row 5: forwards error while skipping", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(skip(5));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
