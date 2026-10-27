import { describe, it, expect } from "vitest";
import { share } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * share — ref-counted multicast (docs/operators/share.md, Cluster C).
 * Two observers subscribe at different virtual times; captured arrays pin the
 * exact frames/values each receives (avoids synchronous-group ambiguity).
 */
describe("share — Mealy machine STT (multicast)", () => {
  // One shared source subscription; a late subscriber (plain Subject) sees only
  // values emitted AFTER it joins.
  it("late subscriber sees only values emitted after it joins", () => {
    const s = makeScheduler();
    const s1: string[] = [];
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c-d-e|", {
        a: "a", b: "b", c: "c", d: "d", e: "e",
      });
      const shared = source.pipe(share());
      shared.subscribe({ next: (v) => s1.push(`${s.frame}:${v}`) });
      s.schedule(
        () => shared.subscribe({ next: (v) => s2.push(`${s.frame}:${v}`) }),
        5
      );
    });
    // sub1 sees everything; sub2 (joining @5, after c@4) sees d@6, e@8.
    expect(s1).toEqual(["0:a", "2:b", "4:c", "6:d", "8:e"]);
    expect(s2).toEqual(["6:d", "8:e"]);
  });
});
