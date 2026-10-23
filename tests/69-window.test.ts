import { describe, it } from "vitest";
import { window, windowWhen, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * window / windowWhen — the window* twin of buffer/bufferWhen. Emits nested
 * Observables; we flatten each to an array (mergeMap + toArray) to compare
 * contents (docs/15, Sections 2-3).
 */
describe("window — Mealy machine STT (external boundary)", () => {
  // Same boundary logic as buffer, but Λ emits Observables (flattened here).
  it("groups values into windows, flushed as observables at boundaries", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("     -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const boundaries = cold(" --x--x|", { x: true });
      // window contents mirror the buffer test: [1], [2,3], [4].
      // Each flattened window emits its array when it closes (at the boundary /
      // on complete). Oracle-aligned with buffer timings.
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

  // windowWhen: fresh closing selector per window
  it("windowWhen: windows close per the closing selector", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const result = source.pipe(
        windowWhen(() => cold("--(x|)", { x: true })),
        mergeMap((w) => w.pipe(toArray()))
      );
      // Closing every 2ms => one value per window (mirrors bufferWhen).
      expectObservable(result).toBe("--p-q-r-(s|)", {
        p: [1],
        q: [2],
        r: [3],
        s: [4],
      });
    });
  });
});
