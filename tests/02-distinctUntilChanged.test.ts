import { describe, it } from "vitest";
import { distinctUntilChanged } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * Mealy-machine test suite for `distinctUntilChanged`.
 * Each test maps to a row of the State Transition Table (STT) in
 * docs/02-distinctUntilChanged.md.
 */
describe("distinctUntilChanged — Mealy machine STT", () => {
  // Row 1: S0 --next(v)--> S1(v) / emit(v)   (bootstrap: first value always emits)
  it("Row 1: first value always emits (S0 -> S1)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     -a|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 2: S1(p) --next(v) [v === p]--> S1(p) / noop   (suppress duplicate)
  it("Row 2: suppresses a consecutive duplicate (self-loop, no emit)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-a|", { a: 1 });
      const expected = "     -a--|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 1 });
    });
  });

  // Row 3: S1(p) --next(v) [v !== p]--> S1(v) / emit(v)   (changed value)
  it("Row 3: emits when the value changes (S1(p) -> S1(v))", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     -a-b|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 3 (classic): only *consecutive* duplicates are removed; a-a-b-b-a
  it("Row 3 (classic): removes only consecutive duplicates", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-a-b-b-a|", { a: 1, b: 2 });
      const expected = "     -a---b---a|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Row 4: S0 --complete--> Done / complete   (empty source)
  it("Row 4: empty source completes with no emission (S0 -> Done)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  ---|");
      const expected = "     ---|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected);
    });
  });

  // Row 5: S1(p) --complete--> Done / complete
  it("Row 5: completes after having emitted (S1 -> Done)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-a|", { a: 7 });
      const expected = "     -a--|";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 7 });
    });
  });

  // Row 6: any --error(e)--> Done / error(e)
  it("Row 6: forwards error from either state", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(distinctUntilChanged());
      expectObservable(result).toBe(expected, { a: 1 }, new Error("boom"));
    });
  });

  // Row 3 variant: custom comparator changes the guard predicate
  it("Row 3 variant: custom comparator (compare by .id)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = { id: 1, label: "x" };
      const b = { id: 1, label: "y" }; // same id => treated as duplicate
      const c = { id: 2, label: "z" };
      const source = cold("  -a-b-c|", { a, b, c });
      const expected = "     -a---c|";
      const result = source.pipe(
        distinctUntilChanged((prev, curr) => prev.id === curr.id)
      );
      expectObservable(result).toBe(expected, { a, c });
    });
  });
});
