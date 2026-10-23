import { describe, it, expect } from "vitest";
import { share, shareReplay } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * share / shareReplay — ref-counted multicast (docs/16, Cluster C).
 *
 * These prove the multicast behaviour by subscribing TWO observers at
 * different virtual times and capturing what each receives. Using captured
 * arrays (instead of marble `expectObservable`) avoids the synchronous-group
 * frame-counting pitfall while still pinning exact frames and values.
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
