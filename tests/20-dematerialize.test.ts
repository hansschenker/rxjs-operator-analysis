import { describe, it } from "vitest";
import { dematerialize, materialize } from "rxjs";
import { makeScheduler } from "./helpers/scheduler";

/** dematerialize — unwrap Notification values back into real notifications. */
describe("dematerialize — Mealy machine STT", () => {
  // Row 1 + 2: 'N' notifications become next values; 'C' becomes complete.
  it("Rows 1+2: unwraps N notifications and completes on a C notification", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", {
        a: { kind: "N", value: 1 },
        b: { kind: "N", value: 2 },
        c: { kind: "C" },
      });
      // Unwrapped: 1@1, 2@3, then complete at the C-notification frame (5).
      const expected = "     -x-y-|";
      const result = source.pipe(dematerialize());
      expectObservable(result).toBe(expected, { x: 1, y: 2 });
    });
  });

  // Row 3: an 'E' notification becomes a real error.
  it("Row 3: an E notification is replayed as a real error", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const err = new Error("boom");
      const source = cold("  -a-b|", {
        a: { kind: "N", value: 1 },
        b: { kind: "E", error: err },
      });
      const expected = "     -x-#";
      const result = source.pipe(dematerialize());
      expectObservable(result).toBe(expected, { x: 1 }, err);
    });
  });

  // Round-trip identity: materialize then dematerialize reconstructs the source.
  it("round-trip: materialize + dematerialize is the identity (next/complete)", () => {
    const s = makeScheduler();
    s.run(({ cold, expectObservable }) => {
      const source = cold("  -a-b-c|", { a: 1, b: 2, c: 3 });
      const expected = "     -a-b-c|";
      const result = source.pipe(materialize(), dematerialize());
      expectObservable(result).toBe(expected, { a: 1, b: 2, c: 3 });
    });
  });
});
