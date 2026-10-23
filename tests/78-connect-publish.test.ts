import { describe, it, expect } from "vitest";
import {
  connect,
  publish,
  publishBehavior,
  publishReplay,
  publishLast,
  multicast,
  refCount,
  merge,
  map,
  Subject,
} from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/**
 * The classic multicast plumbing: connect / multicast / refCount / publish*.
 * One Cold<->Hot skeleton parameterised by (a) Subject type and (b) connect
 * policy (docs/16, Cluster C). Multi-subscriber cases use captured arrays to
 * pin exact frames/values without synchronous-group marble ambiguity.
 */
describe("connect — modern multicast primitive", () => {
  // connect shares the source within a selector; here mapped x10.
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

describe("publishReplay / publishLast — Replay / Async subjects", () => {
  // publishReplay(n): late subscriber replays the last n values.
  it("publishReplay replays the last n values to a late subscriber", () => {
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

  // publishLast (AsyncSubject): only the final value, on complete.
  it("publishLast emits only the final value on completion", () => {
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
