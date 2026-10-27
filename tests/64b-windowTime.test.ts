import { describe, it } from "vitest";
import { windowTime, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** windowTime — time-boundary windowing into nested observables (docs/operators/windowTime.md, E). */
describe("windowTime — Mealy machine STT (time boundary)", () => {
  // windowTime: nested observables instead of arrays — flatten back to arrays
  it("emits windows as nested observables", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a 9ms b 40ms c|", { a: "a", b: "b", c: "c" });
      const expected = "     30ms x 21ms (y|)";
      // collect each window observable into an array to compare contents
      const result = source.pipe(
        windowTime(30),
        mergeMap((w) => w.pipe(toArray()))
      );
      expectObservable(result).toBe(expected, { x: ["a", "b"], y: ["c"] });
    });
  });
});
