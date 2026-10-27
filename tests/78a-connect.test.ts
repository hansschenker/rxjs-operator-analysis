import { describe, it } from "vitest";
import { connect, merge, map } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** connect — modern multicast primitive; share the source within a selector (docs/operators/connect.md, C). */
describe("connect — modern multicast primitive", () => {
  it("shares the source inside the selector", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-b-c|", { a: 1, b: 2, c: 3 });
      const result = source.pipe(
        connect((shared) => merge(shared.pipe(map((x) => x * 10))))
      );
      expectObservable(result).toBe("x-y-z|", { x: 10, y: 20, z: 30 });
    });
  });
});
