import { describe, it } from "vitest";
import { concat } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** concat — sequential, one source at a time (docs/operators/concat.md, Strategy C). */
describe("concat — Mealy machine STT (sequential)", () => {
  // Row 2: if the first source never completes, the second never runs.
  it("Row 2: a non-completing first source blocks the second", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a-", { a: "a" }); // never completes
      const b = cold("    b|", { b: "b" });
      const result = concat(a, b);
      const expected = "  x-x-"; // b never reached
      expectObservable(result).toBe(expected, { x: "a" });
    });
  });
});
