import { describe, it, expect } from "vitest";
import { shareReplay } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** shareReplay — ref-counted multicast with replay buffer (docs/operators/shareReplay.md, C). */
describe("shareReplay — multicast with replay", () => {
  // shareReplay(n): a late subscriber receives the last n buffered values.
  it("late subscriber receives the replayed buffer", () => {
    const s = makeScheduler();
    const s2: string[] = [];
    s.run(({ cold }) => {
      const source = cold("a-b-c-d-e|", {
        a: "a", b: "b", c: "c", d: "d", e: "e",
      });
      const shared = source.pipe(shareReplay(2));
      shared.subscribe({});
      s.schedule(
        () =>
          shared.subscribe({
            next: (v) => s2.push(`${s.frame}:${v}`),
            complete: () => s2.push(`${s.frame}:C`),
          }),
        5
      );
    });
    // sub2 @5 replays the last 2 (b,c) synchronously, then live d@6, e@8, C@9.
    expect(s2).toEqual(["5:b", "5:c", "6:d", "8:e", "9:C"]);
  });
});
