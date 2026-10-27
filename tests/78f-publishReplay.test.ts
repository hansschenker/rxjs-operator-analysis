import { describe, it, expect } from "vitest";
import { publishReplay, refCount } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** publishReplay — ReplaySubject multicast; replays last n to late subscribers (docs/operators/publishReplay.md, C). */
describe("publishReplay — ReplaySubject multicast", () => {
  // publishReplay(n): late subscriber replays the last n values.
  it("replays the last n values to a late subscriber", () => {
    const s = makeScheduler();
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c-d|", { a: "a", b: "b", c: "c", d: "d" });
      const shared = source.pipe(publishReplay(2), refCount());
      shared.subscribe({});
      s.schedule(
        () =>
          shared.subscribe({
            next: (v) => s2.push(`${s.frame}:${v}`),
            complete: () => s2.push(`${s.frame}:C`),
          }),
        4
      );
    });
    // sub2 @4 replays last 2 (b,c) synchronously, then live d@6, C@7.
    expect(s2).toEqual(["4:b", "4:c", "6:d", "7:C"]);
  });
});
