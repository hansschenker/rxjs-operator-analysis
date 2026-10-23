import { describe, it } from "vitest";
import { concatMap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * concatMap — merge with concurrency 1: ordered, non-overlapping queue.
 * Shared shape with switch/exhaust tests (outer "ab|", inner "x-y|") so the
 * four policies are directly comparable (docs/12).
 */
describe("concatMap — Mealy machine STT (concat policy)", () => {
  // Queue policy: the SECOND inner does not start until the first completes.
  // Oracle: a0@0, a1@2, b0@3, b1@5, C@6.
  it("queues inners: ordered, non-overlapping output", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      const result = outer.pipe(concatMap(inner));
      expectObservable(result).toBe("p-qr-s|", {
        p: "a0",
        q: "a1",
        r: "b0",
        s: "b1",
      });
    });
  });

  // U4: completion waits for the whole queue to drain
  it("U4: completes after the last queued inner finishes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x|", { x: v });
      // a@0 completes @1; b@1 completes @2.
      const result = outer.pipe(concatMap(inner));
      expectObservable(result).toBe("pq|", { p: "a", q: "b" });
    });
  });

  // U3: outer error forwarded
  it("U3: forwards outer error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   a#", { a: "a" }, new Error("boom"));
      const inner = (v: string) => cold("x|", { x: v });
      const result = outer.pipe(concatMap(inner));
      expectObservable(result).toBe("p#", { p: "a" }, new Error("boom"));
    });
  });
});
