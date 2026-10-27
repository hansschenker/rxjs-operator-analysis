import { describe, it } from "vitest";
import { throttle, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** throttle — leading silence window with a duration selector (docs/operators/throttle.md, C). */
describe("throttle — Mealy machine STT (leading window)", () => {
  // throttle: leading emit, then silence for the duration (like throttleTime).
  it("emits the leading value, silences the window", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 emits (leading). Each later value (b@5,c@10,d@15,e@20) lands while
      // a throttle window is open and none re-triggers an emission under the
      // default {leading:true, trailing:false} config. Source completes @21.
      // Oracle: a@0, complete@21.
      const source = cold("  a----b----c----d----e|", {
        a: "a", b: "b", c: "c", d: "d", e: "e",
      });
      const result = source.pipe(throttle(() => timer(20)));
      expectObservable(result).toBe("a 20ms |", { a: "a" });
    });
  });
});
