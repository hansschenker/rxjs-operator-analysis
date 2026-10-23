import { describe, it } from "vitest";
import { combineLatestWith, combineLatest } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** combineLatest — latest-slot combination (docs/13, Strategy A). */
describe("combineLatest — Mealy machine STT (latest-slots)", () => {
  // Rows 2 + 3: wait for both to emit once, then re-emit on ANY change.
  // Oracle: [a,x]@1, [b,x]@3, [b,y]@3, C@4.
  it("Rows 2+3: emits once both have spoken, re-emits on any change", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // Stagger b so outputs land on distinct frames (avoids a synchronous
      // group in the marble): [a,x]@1, [b,x]@3, [b,y]@4, C@5.
      const a = cold("    a--b|", { a: "a", b: "b" });
      const b = cold("    -x--y|", { x: "x", y: "y" });
      const result = a.pipe(combineLatestWith(b));
      expectObservable(result).toBe("-p-qr|", {
        p: ["a", "x"],
        q: ["b", "x"],
        r: ["b", "y"],
      });
    });
  });

  // Row 1/5: a source that completes WITHOUT emitting => whole result completes
  // with no emission (its slot can never be filled).
  it("a source that never emits makes the result complete empty", () => {
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
