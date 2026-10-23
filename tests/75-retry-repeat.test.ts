import { describe, it } from "vitest";
import { retry, repeat, retryWhen, repeatWhen, take } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** Resubscription loops: retry / repeat / retryWhen / repeatWhen (docs/16, B). */
describe("retry — Mealy machine STT (restart on error)", () => {
  // Rows 1-4: resubscribe on error up to count, then error out.
  it("Rows 1-4: resubscribes on error, erroring after count exhausted", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      // retry(1): a@0, error@2 -> resubscribe -> a@2, error@4 (exhausted).
      const expected = "   a-a-#";
      const result = source.pipe(retry(1));
      expectObservable(result).toBe(expected, { a: "a" }, new Error("x"));
    });
  });
});

describe("repeat — Mealy machine STT (restart on complete)", () => {
  // Rows 1-3: resubscribe on complete up to count, then complete.
  it("Rows 1-3: resubscribes on complete, completing after count", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-|", { a: "a" });
      // repeat(2): a@0, complete@2 -> resubscribe -> a@2, complete@4.
      const expected = "   a-a-|";
      const result = source.pipe(repeat(2));
      expectObservable(result).toBe(expected, { a: "a" });
    });
  });

  // Row 4: an error aborts the repeat loop immediately.
  it("Row 4: an error aborts the repeat loop", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      const result = source.pipe(repeat(5));
      expectObservable(result).toBe("a-#", { a: "a" }, new Error("x"));
    });
  });
});

describe("retryWhen / repeatWhen — notifier-driven loops", () => {
  // retryWhen: resubscribe when the notifier emits (bounded here by take).
  it("retryWhen: resubscribes when the notifier emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-#", { a: "a" }, new Error("x"));
      // The error notifier is capped with take(1): on the first error it emits
      // then completes, which completes the whole stream. Oracle: a@0, C@2.
      const result = source.pipe(retryWhen((errs) => errs.pipe(take(1))));
      expectObservable(result).toBe("a-|", { a: "a" });
    });
  });

  // repeatWhen: resubscribe when the notifier emits (on complete).
  it("repeatWhen: resubscribes when the notifier emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("a-|", { a: "a" });
      const result = source.pipe(repeatWhen((notes) => notes.pipe(take(1))));
      // a@0, complete@2 -> repeat -> a@2, notifier completes => complete@4.
      expectObservable(result).toBe("a-a-|", { a: "a" });
    });
  });
});
