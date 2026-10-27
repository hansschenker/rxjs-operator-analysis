import { describe, it } from "vitest";
import { zip } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** zip — per-source queue, index pairing (docs/operators/zip.md, Strategy B). */
describe("zip — Mealy machine STT (per-source queue)", () => {
  // Row 2: emit the i-th tuple only when every source has its i-th value.
  it("Row 2: pairs by index, buffering the faster source", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a--b--c|", { a: "a", b: "b", c: "c" });
      const b = cold("    -x-y|", { x: "x", y: "y" });
      const result = zip([a, b]);
      expectObservable(result).toBe("-p-q|", {
        p: ["a", "x"],
        q: ["b", "y"],
      });
    });
  });

  // Row 3: a drained source completing ends the zip (3rd tuple impossible).
  it("Row 3: completes when a source drains (no more pairs possible)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    abc|", { a: "a", b: "b", c: "c" });
      const b = cold("    xy|", { x: "x", y: "y" }); // only 2 values
      const result = zip([a, b]);
      expectObservable(result).toBe("pq|", { p: ["a", "x"], q: ["b", "y"] });
    });
  });

  // Row 5: error terminates
  it("Row 5: error terminates the zip", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const a = cold("    a-#", { a: "a" }, new Error("boom"));
      const b = cold("    -x-y|", { x: "x", y: "y" });
      const result = zip([a, b]);
      expectObservable(result).toBe("-p#", { p: ["a", "x"] }, new Error("boom"));
    });
  });
});
