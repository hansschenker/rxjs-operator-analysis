import { describe, it } from "vitest";
import { timeInterval } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** timeInterval — delta-since-previous metadata tagging (docs/operators/timeInterval.md, F). */
describe("timeInterval — metadata tagging", () => {
  // delta since the previous emission (first is time since subscribe)
  it("reports the gap since the previous value", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      const expected = "     x-y|";
      const result = source.pipe(timeInterval());
      expectObservable(result).toBe(expected, {
        x: { value: "a", interval: 0 },
        y: { value: "b", interval: 2 },
      });
    });
  });
});
