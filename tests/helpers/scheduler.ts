import { TestScheduler } from "rxjs/testing";

/**
 * Creates a fresh RxJS TestScheduler for each test.
 *
 * The TestScheduler drives "virtual time" so that time-based operators
 * (debounceTime, throttleTime) can be tested deterministically. In marble
 * syntax each character frame is 1ms, and a group like `100ms` advances the
 * virtual clock without emitting.
 *
 * Marble legend:
 *   -      1 frame (1ms) of virtual time, nothing happens
 *   a,b..  a "next" notification carrying a value
 *   |      a "complete" notification
 *   #      an "error" notification
 *   ()     values grouped into the same frame (synchronous)
 *   NNms   advance the clock by NN milliseconds
 */
export function makeScheduler(): TestScheduler {
  return new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  });
}
