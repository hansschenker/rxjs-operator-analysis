import { describe, it } from "vitest";
import { switchMap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * switchMap — keep only the latest inner; a new outer value CANCELS the
 * in-flight inner. Shared shape with concat/exhaust tests (docs/12).
 */
describe("switchMap — Mealy machine STT (switch policy)", () => {
  // S1: b@1 cancels a-inner before a1 fires; only a0 then b's values survive.
  // Oracle: a0@0, b0@1, b1@3, C@4.
  it("S1: a new outer value cancels the previous inner", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      const result = outer.pipe(switchMap(inner));
      expectObservable(result).toBe("pq-r|", {
        p: "a0", // a's first value made it out before the switch
        q: "b0", // a-inner cancelled; b's values take over
        r: "b1",
      });
    });
  });

  // U4: if no switch happens, the single inner runs to completion
  it("U4: a lone inner runs fully when no newer outer value arrives", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   a|", { a: "a" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      const result = outer.pipe(switchMap(inner));
      expectObservable(result).toBe("p-q|", { p: "a0", q: "a1" });
    });
  });
});
