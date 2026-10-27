import { describe, it, expect } from "vitest";
import { multicast, refCount, Subject } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * refCount — turns a ConnectableObservable hot on the first subscriber and
 * disconnects on the last; automates the Cold<->Hot transitions
 * (docs/operators/refCount.md, Cluster C).
 */
describe("refCount — automated connect/disconnect", () => {
  // With refCount, the source is subscribed on the first subscriber (hot) and
  // a late subscriber sees only values emitted after it joins (plain Subject).
  it("connects on first subscriber; late subscriber sees only later values", () => {
    const s = makeScheduler();
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c|", { a: "a", b: "b", c: "c" });
      const shared = source.pipe(multicast(() => new Subject()), refCount());
      shared.subscribe({}); // first subscriber -> connect
      s.schedule(
        () =>
          shared.subscribe({
            next: (v) => s2.push(`${s.frame}:${v}`),
            complete: () => s2.push(`${s.frame}:C`),
          }),
        3
      );
    });
    // sub2 @3 (after b@2) sees only c@4, then complete@5 — one shared source run.
    expect(s2).toEqual(["4:c", "5:C"]);
  });
});
