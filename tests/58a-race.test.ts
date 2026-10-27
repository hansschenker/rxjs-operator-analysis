import { describe, it } from "vitest";
import { race } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** race — winner-lock on first emission (docs/operators/race.md, Strategy D). */
describe("race — Mealy machine STT (winner-lock)", () => {
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

  // Row 1+3: the other source wins when it emits first; loser dropped.
  it("Row 1+3: the first source to emit wins, the other is dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    --a-b|", { a: "a", b: "b" });
      const b = cold("    -x-y|", { x: "x", y: "y" }); // emits first @1
      const result = race([a, b]);
      expectObservable(result).toBe("-p-q|", { p: "x", q: "y" });
    });
  });
});
