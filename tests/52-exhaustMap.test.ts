import { describe, it } from "vitest";
import { exhaustMap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * exhaustMap — ignore new outer values while an inner is busy (the dual of
 * switch: protect the OLD inner, drop the NEW value). Shared shape (docs/12).
 */
describe("exhaustMap — Mealy machine STT (exhaust policy)", () => {
  // E2: b@1 arrives while a-inner is busy => b is DROPPED entirely.
  // Oracle: a0@0, a1@2, C@3.
  it("E2: a new outer value is dropped while an inner is busy", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      const result = outer.pipe(exhaustMap(inner));
      expectObservable(result).toBe("p-q|", { p: "a0", q: "a1" });
    });
  });

  // E1 + E3: once the inner completes, a LATER outer value is accepted again.
  it("E1+E3: a new outer value after the inner finishes is accepted", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // a@0 (inner busy frames 0..3), b@4 (after a-inner done) => b accepted.
      const outer = cold("   a---b|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      // a0@0, a1@2 (a-inner done @3); b0@4, b1@6, C@7.
      const result = outer.pipe(exhaustMap(inner));
      expectObservable(result).toBe("p-q-r-s|", {
        p: "a0",
        q: "a1",
        r: "b0",
        s: "b1",
      });
    });
  });
});
