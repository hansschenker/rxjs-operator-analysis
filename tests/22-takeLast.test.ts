import { describe, it } from "vitest";
import { takeLast } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** takeLast(n) — buffer the tail, emit on complete (docs/10, Sub-family A). */
describe("takeLast — Mealy machine STT", () => {
  // Rows 1-3: buffer last n, flush in order at completion
  it("Rows 1-3: emits the last n values in order on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // takeLast(2) => c,d flushed synchronously at complete frame (8)
      const expected = "     --------(cd|)";
      const result = source.pipe(takeLast(2));
      expectObservable(result).toBe(expected, { c: 3, d: 4 });
    });
  });

  // Row 1: fewer values than n -> emit all of them
  it("Row 1: fewer than n values emits all of them", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     ----(ab|)";
      const result = source.pipe(takeLast(5));
      expectObservable(result).toBe(expected, { a: 1, b: 2 });
    });
  });

  // Boundary n=0: EMPTY (never subscribes meaningfully)
  it("Boundary n=0: emits nothing and completes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b|", { a: 1, b: 2 });
      const expected = "     |";
      const result = source.pipe(takeLast(0));
      expectObservable(result).toBe(expected);
    });
  });

  // Row 4: error forwarded, buffered tail dropped (no flush)
  it("Row 4: error forwarded, buffered values dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-#", { a: 1, b: 2 }, new Error("boom"));
      const expected = "     -----#";
      const result = source.pipe(takeLast(2));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
