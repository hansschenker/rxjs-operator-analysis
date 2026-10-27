import { describe, it } from "vitest";
import { combineLatest } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** combineLatest — latest-slot combination (docs/operators/combineLatest.md, Strategy A). */
describe("combineLatest — Mealy machine STT (latest-slots)", () => {
  // Rows 2+3: wait for both to emit once, then re-emit on ANY change.
  it("Rows 2+3: emits once both have spoken, re-emits on any change", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a--b|", { a: "a", b: "b" });
      const b = cold("    -x--y|", { x: "x", y: "y" });
      const result = combineLatest([a, b]);
      expectObservable(result).toBe("-p-qr|", {
        p: ["a", "x"],
        q: ["b", "x"],
        r: ["b", "y"],
      });
    });
  });

  // Row 1/5: a source that completes WITHOUT emitting => whole result completes
  // with no emission (its slot can never be filled).
  it("Row 1/5: a source that never emits makes the result complete empty", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-|", { a: "a" });
      const b = cold("    --|"); // completes without ever emitting
      const result = combineLatest([a, b]);
      const expected = "  --|";
      expectObservable(result).toBe(expected);
    });
  });

  // Row 6: error tears everything down
  it("Row 6: error from either source terminates", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a--|", { a: "a" });
      const b = cold("    -#", undefined, new Error("boom"));
      const result = combineLatest([a, b]);
      const expected = "  -#";
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
