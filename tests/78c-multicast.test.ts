import { describe, it } from "vitest";
import { multicast, refCount, Subject } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** multicast — the subject-factory multicast primitive (docs/operators/multicast.md, C). */
describe("multicast — subject-factory multicast", () => {
  // multicast(() => new Subject()) + refCount equals publish+refCount.
  it("multicast(Subject)+refCount equals publish+refCount", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-b-c|", { a: "a", b: "b", c: "c" });
      const shared = source.pipe(multicast(() => new Subject()), refCount());
      expectObservable(shared).toBe("a-b-c|", { a: "a", b: "b", c: "c" });
    });
  });
});
