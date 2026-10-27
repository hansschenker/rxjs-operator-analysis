import { describe, it } from "vitest";
import { windowWhen, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * windowWhen — the window* twin of bufferWhen: fresh closing selector per
 * window, emitting Observables (flattened here). docs/operators/windowWhen.md, §3.
 */
describe("windowWhen — Mealy machine STT (per-cycle closing selector)", () => {
  it("windows close per the closing selector", () => {
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
