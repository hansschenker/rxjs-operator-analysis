import { describe, it } from "vitest";
import { publishLast, refCount } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** publishLast — AsyncSubject multicast; only the final value on complete (docs/operators/publishLast.md, C). */
describe("publishLast — AsyncSubject multicast", () => {
  // publishLast (AsyncSubject): only the final value, on complete.
  it("emits only the final value on completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-b-c|", { a: "a", b: "b", c: "c" });
      const shared = source.pipe(publishLast(), refCount());
      // only the final value c, emitted at completion. Source a-b-c| completes
      // @5 (a@0,b@2,c@4,complete@5), so publishLast emits (c|) @5.
      expectObservable(shared).toBe("-----(c|)", { c: "c" });
    });
  });
});
