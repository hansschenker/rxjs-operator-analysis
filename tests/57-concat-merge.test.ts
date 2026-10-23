import { describe, it } from "vitest";
import { concatWith, mergeWith, concat, merge } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** concat & merge — sequential vs interleave (docs/13, Strategy C). */
describe("concat / merge — Mealy machine STT", () => {
  // concat Row 1/2: source A fully, THEN source B (ordered, no overlap).
  it("concat: forwards A fully, then B in order", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a|", { a: "a" });
      const b = cold("    b-b|", { b: "b" });
      // a@0, a@2, (a completes @3) then b@3, b@5, complete@6.
      const result = a.pipe(concatWith(b));
      expectObservable(result).toBe("x-xy-y|", { x: "a", y: "b" });
    });
  });

  // concat Row 2: if the first source never completes, the second never runs.
  it("concat: a non-completing first source blocks the second", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a-", { a: "a" }); // never completes
      const b = cold("    b|", { b: "b" });
      const result = concat(a, b);
      const expected = "  x-x-"; // b never reached
      expectObservable(result).toBe(expected, { x: "a" });
    });
  });

  // merge Row 1: all sources at once, interleaved by time.
  it("merge: interleaves values from all sources by time", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a|", { a: "a" });
      const b = cold("    -b-b|", { b: "b" });
      // a@0, b@1, a@2, b@3, complete@4 (both done).
      const result = a.pipe(mergeWith(b));
      expectObservable(result).toBe("xyxy|", { x: "a", y: "b" });
    });
  });

  // merge Row 3/4: completes only when ALL sources complete.
  it("merge: completes only after every source completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a|", { a: "a" });
      const b = cold("    b---|", { b: "b" });
      const result = merge(a, b);
      // a@0, b@0 (synchronous group); b completes @4. The group (xy) advances
      // the marble cursor by its full character count (4: '(','x','y',')'),
      // so (xy)| places the completion at frame 4.
      expectObservable(result).toBe("(xy)|", { x: "a", y: "b" });
    });
  });
});
