import { describe, it } from "vitest";
import { skipUntil } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** skipUntil(notifier) — gate opens on first notifier emission (docs/10, C). */
describe("skipUntil — Mealy machine STT", () => {
  // Rows 1 + 2 + 3: discard source until notifier emits, then pass the rest
  it("Rows 1-3: discards source until the notifier emits, then passes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const notifier = cold("----n---|", { n: true });
      // notifier opens the gate @4; c@5 and d@7 pass, a/b dropped.
      const expected = "     -----c-d|";
      const result = source.pipe(skipUntil(notifier));
      expectObservable(result).toBe(expected, { c: 3, d: 4 });
    });
  });

  // Gate never opens: notifier never emits -> nothing passes
  it("if the notifier never emits, nothing passes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const notifier = cold("--------"); // never emits
      const expected = "     ----|";
      const result = source.pipe(skipUntil(notifier));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 5: source error forwarded even while gated
  it("Row 5: forwards source error while gated", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const notifier = cold("-------n|", { n: true });
      const expected = "     ---#";
      const result = source.pipe(skipUntil(notifier));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
