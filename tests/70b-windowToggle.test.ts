import { describe, it } from "vitest";
import { windowToggle, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** windowToggle — the window* twin of bufferToggle; emits observables (flattened). docs/operators/windowToggle.md, §4. */
describe("windowToggle — Mealy machine STT (openings + closings)", () => {
  it("same toggling as bufferToggle, emits observables (flattened)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   abcdef|", { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const openings = cold(" o--o--|", { o: 1 });
      const result = source.pipe(
        windowToggle(openings, () => cold("--(x|)", { x: true })),
        mergeMap((w) => w.pipe(toArray()))
      );
      expectObservable(result).toBe("--p--q|", {
        p: [1, 2, 3],
        q: [4, 5, 6],
      });
    });
  });
});
