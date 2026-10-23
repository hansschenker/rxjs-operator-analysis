import { describe, it } from "vitest";
import { throttle, debounce, timer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** throttle / debounce — durationSelector generalizations (docs/14, C/D). */
describe("throttle / debounce — selector generalizations", () => {
  // throttle: leading emit, then silence for the duration (like throttleTime).
  it("throttle: emits the leading value, silences the window", () => {
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

  // debounce: emit latest only after a quiet gap of the duration.
  it("debounce: emits the latest value after a quiet period", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // burst a,b,c within <20ms collapses; emit last (c) 20ms after c.
      const source = cold("  a-b-c 25ms |", { a: "a", b: "b", c: "c" });
      // c@4; quiet 20ms => emit c@24; source completes @30.
      const expected = "     24ms c 5ms |";
      const result = source.pipe(debounce(() => timer(20)));
      expectObservable(result).toBe(expected, { c: "c" });
    });
  });
});
