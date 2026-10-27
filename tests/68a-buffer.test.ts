import { describe, it } from "vitest";
import { buffer } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** buffer — array flush on an external notifier (docs/operators/buffer.md, §2). */
describe("buffer — Mealy machine STT (external notifier)", () => {
  // Rows 1-3: collect until the notifier emits; flush the array each time.
  it("Rows 1-3: flushes a buffer array each time the notifier emits", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      const notifier = cold(" --x--x|", { x: true });
      // close@2 => [1]; close@5 => [2,3]; source completes @8 => [4].
      const expected = "      --p--q--(r|)";
      const result = source.pipe(buffer(notifier));
      expectObservable(result).toBe(expected, { p: [1], q: [2, 3], r: [4] });
    });
  });

  // Row 4: error forwarded, pending buffer dropped
  it("Row 4: error forwarded, pending buffer dropped", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-#", { a: 1 }, new Error("boom"));
      const notifier = cold(" -----x|", { x: true });
      const expected = "      ---#";
      const result = source.pipe(buffer(notifier));
      expectObservable(result).toBe(expected, undefined, new Error("boom"));
    });
  });
});
