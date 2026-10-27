import { describe, it } from "vitest";
import { timestamp } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** timestamp — absolute-clock metadata tagging projector (docs/operators/timestamp.md, F). */
describe("timestamp — metadata tagging", () => {
  // attaches the absolute scheduler clock time to each value
  it("tags each value with the current time", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a-b|", { a: "a", b: "b" });
      const expected = "     x-y|";
      const result = source.pipe(timestamp());
      expectObservable(result).toBe(expected, {
        x: { value: "a", timestamp: 0 },
        y: { value: "b", timestamp: 2 },
      });
    });
  });
});
