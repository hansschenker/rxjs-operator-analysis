import { describe, it } from "vitest";
import { window, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * window — the window* twin of buffer. Emits nested Observables; we flatten
 * each to an array (mergeMap + toArray) to compare contents
 * (docs/operators/window.md, §2).
 */
describe("window — Mealy machine STT (external boundary)", () => {
  // Same boundary logic as buffer, but Λ emits Observables (flattened here).
  it("groups values into windows, flushed as observables at boundaries", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("     -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const boundaries = cold(" --x--x|", { x: true });
      // window contents mirror the buffer test: [1], [2,3], [4].
      const result = source.pipe(
        window(boundaries),
        mergeMap((w) => w.pipe(toArray()))
      );
      expectObservable(result).toBe("--p--q--(r|)", {
        p: [1],
        q: [2, 3],
        r: [4],
      });
    });
  });
});
