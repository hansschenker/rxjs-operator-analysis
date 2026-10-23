import { describe, it } from "vitest";
import { ignoreElements } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** ignoreElements — swallow all values, keep terminals (docs/10, Sub-family D). */
describe("ignoreElements — Mealy machine STT", () => {
  // Rows 1 + 2: all values dropped, completion forwarded
  it("Rows 1+2: drops all values and forwards completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     ------|";
      const result = source.pipe(ignoreElements());
      expectObservable(result).toBe(expected);
    });
  });

  // Row 3: error still forwarded
  it("Row 3: forwards error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-#", { a: 1 }, new Error("boom"));
      const expected = "     ---#";
      const result = source.pipe(ignoreElements());
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
