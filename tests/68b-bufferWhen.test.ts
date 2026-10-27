import { describe, it } from "vitest";
import { bufferWhen } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** bufferWhen — array flush per a fresh closing selector each cycle (docs/operators/bufferWhen.md, §3). */
describe("bufferWhen — Mealy machine STT (per-cycle closing selector)", () => {
  // a fresh closing selector observable per cycle
  it("flushes per the closing selector's cycle", () => {
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
});
