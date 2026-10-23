import { describe, it } from "vitest";
import { map } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** map — STT in docs/09-transformation-family.md (Sub-family A). */
describe("map — Mealy machine STT", () => {
  // Row 1: Op --next(v)--> Op / emit(f(v,i))
  it("Row 1: projects every value with f(v, i)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -x-y-z|";
      const result = source.pipe(map((v) => v * 10));
      expectObservable(result).toBe(expected, { x: 10, y: 20, z: 30 });
    });
  });

  // Row 1: the index argument i is threaded
  it("Row 1: threads the index argument i", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 0, b: 0, c: 0 });
      const expected = "     -x-y-z|";
      const result = source.pipe(map((_v, i) => i));
      expectObservable(result).toBe(expected, { x: 0, y: 1, z: 2 });
    });
  });

  // Row 2: Op --complete--> Done / complete
  it("Row 2: forwards completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a|", { a: 1 });
      const expected = "     -x|";
      const result = source.pipe(map((v) => v + 1));
      expectObservable(result).toBe(expected, { x: 2 });
    });
  });

  // Row 3: Op --error--> Done / error
  it("Row 3: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     -x-#";
      const result = source.pipe(map((v) => v + 1));
      expectObservable(result).toBe(expected, { x: 2 }, new Error("boom"));
    });
  });
});
