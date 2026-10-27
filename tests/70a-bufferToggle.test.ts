import { describe, it } from "vitest";
import { bufferToggle } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** bufferToggle — openings + per-buffer closings, overlapping buffers (docs/operators/bufferToggle.md, §4). */
describe("bufferToggle — Mealy machine STT (openings + closings)", () => {
  // Rows 1-3: each opening starts a buffer closed by its own closing selector.
  it("Rows 1-3: a buffer per opening, closed by its closing selector", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   abcdef|", { a: 1, b: 2, c: 3, d: 4, e: 5, f: 6 });
      const openings = cold(" o--o--|", { o: 1 });
      // open@0 (closes @2 => [1,2,3]); open@3 (closes @5 => [4,5,6]).
      const result = source.pipe(
        bufferToggle(openings, () => cold("--(x|)", { x: true }))
      );
      // [1,2,3]@2, [4,5,6]@5, complete@6 (separate frame). Oracle-confirmed.
      expectObservable(result).toBe("--p--q|", {
        p: [1, 2, 3],
        q: [4, 5, 6],
      });
    });
  });
});
