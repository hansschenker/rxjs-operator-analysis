import { describe, it } from "vitest";
import { buffer, bufferWhen } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** buffer / bufferWhen — array flush on a boundary (docs/15, Sections 2-3). */
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

  // bufferWhen: a fresh closing selector observable per cycle
  it("bufferWhen: flushes per the closing selector's cycle", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("   -a-b-c-d|", { a: 1, b: 2, c: 3, d: 4 });
      // The closing selector "--(x|)" closes every 2ms, so each cycle captures
      // just one value: [1]@2, [2]@4, [3]@6, [4]@8, complete@8. (Oracle.)
      const result = source.pipe(bufferWhen(() => cold("--(x|)", { x: true })));
      expectObservable(result).toBe("--p-q-r-(s|)", {
        p: [1],
        q: [2],
        r: [3],
        s: [4],
      });
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
