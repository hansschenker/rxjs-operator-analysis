import { describe, it, expect } from "vitest";
import { publishBehavior, refCount } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** publishBehavior — BehaviorSubject multicast; late subscriber gets latest (docs/operators/publishBehavior.md, C). */
describe("publishBehavior — BehaviorSubject multicast", () => {
  // Late subscriber immediately receives the latest value.
  it("a late subscriber gets the latest value on subscribe", () => {
    const s = makeScheduler();
    const s1: string[] = [];
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c|", { a: "a", b: "b", c: "c" });
      const shared = source.pipe(publishBehavior("SEED"), refCount());
      shared.subscribe({
        next: (v) => s1.push(`${s.frame}:${v}`),
        complete: () => s1.push(`${s.frame}:C`),
      });
      s.schedule(
        () =>
          shared.subscribe({
            next: (v) => s2.push(`${s.frame}:${v}`),
            complete: () => s2.push(`${s.frame}:C`),
          }),
        2
      );
    });
    // sub1 gets SEED@0 then a@0, b@2, c@4, C@5.
    expect(s1).toEqual(["0:SEED", "0:a", "2:b", "4:c", "5:C"]);
    // sub2 @2 gets the latest value (b) immediately, then c@4, C@5.
    expect(s2).toEqual(["2:b", "4:c", "5:C"]);
  });
});
