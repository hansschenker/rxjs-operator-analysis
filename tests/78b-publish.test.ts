import { describe, it, expect } from "vitest";
import { publish, refCount } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** publish — plain-Subject multicast (docs/operators/publish.md, Cluster C). */
describe("publish + refCount — plain Subject multicast", () => {
  // Late subscriber (plain Subject) sees only values emitted after joining.
  it("a late subscriber sees only subsequent values", () => {
    const s = makeScheduler();
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c|", { a: "a", b: "b", c: "c" });
      const shared = source.pipe(publish(), refCount());
      shared.subscribe({});
      s.schedule(
        () =>
          shared.subscribe({
            next: (v) => s2.push(`${s.frame}:${v}`),
            complete: () => s2.push(`${s.frame}:C`),
          }),
        3
      );
    });
    // sub2 @3 (after b@2) sees only c@4, then complete@5.
    expect(s2).toEqual(["4:c", "5:C"]);
  });
});
