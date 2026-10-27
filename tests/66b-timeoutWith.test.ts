import { describe, it } from "vitest";
import { timeoutWith, of } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** timeoutWith — deprecated due-time + fallback form of timeout (docs/operators/timeoutWith.md, G). */
describe("timeoutWith — Mealy machine STT (watchdog, deprecated)", () => {
  // due time + fallback: switch to the fallback on timeout
  it("switches to the fallback observable on timeout", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  a 40ms b|", { a: "a", b: "b" });
      const expected = "     a 29ms (f|)";
      const result = source.pipe(timeoutWith(30, of("fallback")));
      expectObservable(result).toBe(expected, { a: "a", f: "fallback" });
    });
  });
});
