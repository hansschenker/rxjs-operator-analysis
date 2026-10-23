import { describe, it } from "vitest";
import { groupBy, mergeMap, toArray } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** groupBy — keyed partition into sub-streams (docs/15, Section 6). */
describe("groupBy — Mealy machine STT (keyed partition)", () => {
  // Rows 1-2: a new key spawns a group; known keys route into it.
  it("Rows 1-2: routes values into per-key groups", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("abcd|", { a: 1, b: 2, c: 3, d: 4 });
      // key = v % 2: group 1 (odd) = [1,3]; group 0 (even) = [2,4].
      // Both groups complete & flush (via toArray) at source complete @4.
      const result = source.pipe(
        groupBy((v) => v % 2),
        mergeMap((g) => g.pipe(toArray()))
      );
      expectObservable(result).toBe("----(pq|)", { p: [1, 3], q: [2, 4] });
    });
  });

  // Row 1: a new key emits a NEW group observable downstream
  it("Row 1: each distinct key produces a new group observable", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("aab|", { a: "x", b: "y" });
      // keys: "x","x","y" => two groups (x then y). Count the group emissions.
      const result = source.pipe(
        groupBy((v) => v),
        mergeMap((g) => g.pipe(toArray()))
      );
      // group "x"=[x,x], group "y"=[y]; both flush at complete @3.
      expectObservable(result).toBe("---(pq|)", { p: ["x", "x"], q: ["y"] });
    });
  });

  // Row 4: error forwarded to the output
  it("Row 4: error forwarded", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a#", { a: 1 }, new Error("boom"));
      const result = source.pipe(
        groupBy((v) => v % 2),
        mergeMap((g) => g.pipe(toArray()))
      );
      expectObservable(result).toBe("-#", undefined, new Error("boom"));
    });
  });
});
