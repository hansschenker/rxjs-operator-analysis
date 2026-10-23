import { describe, it } from "vitest";
import { distinctUntilKeyChanged } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** distinctUntilKeyChanged — distinctUntilChanged on value[key] (docs/11, A). */
describe("distinctUntilKeyChanged — Mealy machine STT", () => {
  // Emits when the chosen key changes vs the previous emitted value
  it("emits only when the chosen key changes (consecutive)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = { k: 1, label: "a" };
      const b = { k: 1, label: "b" }; // same k => suppressed
      const c = { k: 2, label: "c" };
      const d = { k: 2, label: "d" }; // same k => suppressed
      const e = { k: 1, label: "e" }; // k changes again => emit
      const source = cold("  -a-b-c-d-e|", { a, b, c, d, e });
      const expected = "     -a---c---e|";
      const result = source.pipe(distinctUntilKeyChanged("k"));
      expectObservable(result).toBe(expected, { a, c, e });
    });
  });

  // First value always emits (bootstrap S0 -> S1)
  it("first value always emits (bootstrap)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = { k: 5 };
      const source = cold("  -a|", { a });
      const expected = "     -a|";
      const result = source.pipe(distinctUntilKeyChanged("k"));
      expectObservable(result).toBe(expected, { a });
    });
  });

  // Error forwarded
  it("forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = { k: 1 };
      const source = cold("  -a-#", { a }, new Error("boom"));
      const expected = "     -a-#";
      const result = source.pipe(distinctUntilKeyChanged("k"));
      expectObservable(result).toBe(expected, { a }, new Error("boom"));
    });
  });
});
