import { describe, it, expect } from "vitest";
import { finalize } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** finalize — teardown edge; callback on any termination (docs/operators/finalize.md, A). */
describe("finalize — teardown edge", () => {
  // Row 2: callback fires on complete.
  it("runs the callback on completion", () => {
    const s = makeScheduler();
    let called = false;
    s.run(({ cold, expectObservable }) => {
      const source = cold("a|", { a: "a" });
      const result = source.pipe(finalize(() => (called = true)));
      expectObservable(result).toBe("a|", { a: "a" });
    });
    expect(called).toBe(true);
  });

  // Row 3: callback fires on error.
  it("runs the callback on error", () => {
    const s = makeScheduler();
    let called = false;
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const result = source.pipe(finalize(() => (called = true)));
      expectObservable(result).toBe("a-#", { a: "a" }, new Error("x"));
    });
    expect(called).toBe(true);
  });
});
