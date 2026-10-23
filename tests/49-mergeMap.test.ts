import { describe, it } from "vitest";
import { mergeMap } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** mergeMap — subscribe all inners concurrently (docs/12, merge policy). */
describe("mergeMap — Mealy machine STT (merge policy)", () => {
  // M1 + U1: two overlapping inners interleave (no ordering preserved)
  it("M1+U1: concurrent inners interleave their emissions", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      // outer emits a@0 and b@1; each inner emits its value twice, 2ms apart.
      // Offsetting b by one frame keeps every output on its own frame (no
      // synchronous groups) so the interleaving is unambiguous.
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-y|", { x: v + "0", y: v + "1" });
      // a-inner: a0@0, a1@2 ; b-inner (starts @1): b0@1, b1@3.
      // Merge interleaves strictly by time: a0@0, b0@1, a1@2, b1@3, complete@4.
      const result = outer.pipe(mergeMap(inner));
      expectObservable(result).toBe("pqrs|", {
        p: "a0",
        q: "b0",
        r: "a1",
        s: "b1",
      });
    });
  });

  // U4: output stays open until the LAST inner completes (outer done earlier)
  it("U4: completes only after the last inner finishes", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   a|", { a: "a" });
      const inner = () => cold("--x|", { x: 1 });
      // outer completes @1, but inner runs to @2 then completes @3.
      const expected = "     --x|";
      const result = outer.pipe(mergeMap(inner));
      expectObservable(result).toBe(expected, { x: 1 });
    });
  });

  // concurrent = 1 behaves like concatMap (queue)
  it("concurrent=1 queues inners (acts like concat)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   ab|", { a: "a", b: "b" });
      const inner = (v: string) => cold("x-|", { x: v });
      // a-inner: a@0, completes @2; THEN b-inner starts @2: b@2, completes @4.
      const result = outer.pipe(mergeMap(inner, 1));
      expectObservable(result).toBe("x-y-|", { x: "a", y: "b" });
    });
  });

  // U3: outer error tears everything down
  it("U3: outer error forwards and tears down inners", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const outer = cold("   a-#", { a: "a" }, new Error("boom"));
      const inner = () => cold("----x|", { x: 1 });
      const expected = "     --#";
      const result = outer.pipe(mergeMap(inner));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
