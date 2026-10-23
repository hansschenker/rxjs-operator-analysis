import { describe, it } from "vitest";
import { bufferTime, windowTime, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** bufferTime / windowTime — time-boundary buffering (docs/14, Sub-family E). */
describe("bufferTime — Mealy machine STT (time boundary)", () => {
  // Rows 1-3: flush a buffer every span ms; span = 30.
  it("Rows 1-3: emits a buffer every span ms", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0, b@10 -> window 0..30 flushes [a,b]@30; c@50 -> [c]@52 (on complete)
      const source = cold("  a 9ms b 40ms c|", { a: "a", b: "b", c: "c" });
      // oracle: [a,b]@30, [c]@52.
      const expected = "     30ms x 21ms (y|)";
      const result = source.pipe(bufferTime(30));
      expectObservable(result).toBe(expected, { x: ["a", "b"], y: ["c"] });
    });
  });

  // An empty window still flushes an empty array [] (contrast bufferCount).
  it("emits an empty array for a window with no values", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  60ms |"); // no values, completes @60
      // windows at 30 and 60 => [] @30, [] @60 (then complete).
      const expected = "     30ms x 29ms (y|)";
      const result = source.pipe(bufferTime(30));
      expectObservable(result).toBe(expected, { x: [], y: [] });
    });
  });

  // windowTime: nested observables instead of arrays — flatten back to arrays
  it("windowTime: emits windows as nested observables", () => {
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
