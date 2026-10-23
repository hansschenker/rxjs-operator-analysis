import { describe, it } from "vitest";
import { takeUntil } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** takeUntil(notifier) — notifier-driven cutoff (docs/10, Sub-family C). */
describe("takeUntil — Mealy machine STT", () => {
  // Rows 1 + 2: pass source until notifier emits, then complete
  it("Rows 1+2: passes source until the notifier emits, then completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const notifier = cold("-----n--|", { n: true });
      // notifier emits @5 => complete; c@5 is cut (notifier wins at same frame).
      const expected = "     -a-b-|";
      const result = source.pipe(takeUntil(notifier));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 3: source completes before notifier -> normal completion
  it("Row 3: source completing before the notifier completes normally", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const notifier = cold("--------n|", { n: true });
      const expected = "     -a-b|";
      const result = source.pipe(takeUntil(notifier));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Notifier that only completes (never emits) does NOT cut off the source
  it("notifier that only completes does not cut off the source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const notifier = cold("--|"); // completes, never emits a value
      const expected = "     -a-b|";
      const result = source.pipe(takeUntil(notifier));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 4: source error forwarded
  it("Row 4: forwards source error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const notifier = cold("-------n|", { n: true });
      const expected = "     -a-#";
      const result = source.pipe(takeUntil(notifier));
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });
});
