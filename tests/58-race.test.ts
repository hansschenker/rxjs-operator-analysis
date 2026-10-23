import { describe, it } from "vitest";
import { raceWith, race } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** race — winner-lock on first emission (docs/13, Strategy D). */
describe("race — Mealy machine STT (winner-lock)", () => {
  // Row 1 + 3: the first source to EMIT wins; the loser is dropped.
  // Oracle (source wins): a@1, b@3, C@4.
  it("Row 1+3: source wins the race, the other is dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    -a-b|", { a: "a", b: "b" }); // emits first @1
      const b = cold("    --x-y|", { x: "x", y: "y" });
      const result = a.pipe(raceWith(b));
      expectObservable(result).toBe("-p-q|", { p: "a", q: "b" });
    });
  });

  // Row 1 + 3: the other source wins when it emits first.
  it("Row 1+3: the other source wins when it emits first", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    --a-b|", { a: "a", b: "b" });
      const b = cold("    -x-y|", { x: "x", y: "y" }); // emits first @1
      const result = a.pipe(raceWith(b));
      expectObservable(result).toBe("-p-q|", { p: "x", q: "y" });
    });
  });

  // Row 4: after locking, output mirrors the winner to completion.
  it("Row 4: output mirrors the winner to completion", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-a|", { a: "a" }); // wins @0
      const b = cold("    -b-b|", { b: "b" });
      const result = race([a, b]);
      expectObservable(result).toBe("x-x|", { x: "a" });
    });
  });
});
