import { describe, it } from "vitest";
import { expand, take, of, EMPTY } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** expand — recursive mergeMap; inner outputs fed back as inputs (docs/15, §7). */
describe("expand — Mealy machine STT (recursive flatten)", () => {
  // Rows 1-2: each value is emitted AND re-projected, breadth-first.
  it("Rows 1-2: emits and recursively re-projects each value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("(a|)", { a: 1 });
      // project n -> of(n+1) until n>=4 (then EMPTY). Synchronous recursion:
      // emit 1, then 2, 3, 4 all at frame 0, then complete.
      const result = source.pipe(
        expand((v: number) => (v < 4 ? of(v + 1) : EMPTY)),
        take(4)
      );
      expectObservable(result).toBe("(pqrs|)", { p: 1, q: 2, r: 3, s: 4 });
    });
  });

  // Base case: a project that returns EMPTY immediately just echoes the input
  it("a project returning EMPTY terminates the recursion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("(a|)", { a: 1 });
      const result = source.pipe(expand(() => EMPTY));
      // only the original value, then complete (no recursion).
      expectObservable(result).toBe("(p|)", { p: 1 });
    });
  });
});
