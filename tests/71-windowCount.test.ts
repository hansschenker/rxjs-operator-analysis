import { describe, it } from "vitest";
import { windowCount, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** windowCount — the count-boundary window (bufferCount's window twin). */
describe("windowCount — Mealy machine STT (count boundary)", () => {
  // Rows 1-2: a new window every `size` values; last window partial.
  it("Rows 1-2: windows of `size` values, last one partial", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("abcde|", { a: "a", b: "b", c: "c", d: "d", e: "e" });
      // windowCount(2): [a,b]@1, [c,d]@3, [e]@5 (partial), complete@5.
      const result = source.pipe(
        windowCount(2),
        mergeMap((w) => w.pipe(toArray()))
      );
      expectObservable(result).toBe("-p-q-(r|)", {
        p: ["a", "b"],
        q: ["c", "d"],
        r: ["e"],
      });
    });
  });

  // Row 3: error forwarded
  it("Row 3: error forwarded", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("ab#", { a: "a", b: "b" }, new Error("boom"));
      const result = source.pipe(
        windowCount(2),
        mergeMap((w) => w.pipe(toArray()))
      );
      // window [a,b] completes @1; error @2.
      expectObservable(result).toBe("-p#", { p: ["a", "b"] }, new Error("boom"));
    });
  });
});
