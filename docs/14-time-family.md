# Session 8 — Time-Based Operators as Mealy Machines

> 16 operators whose behaviour depends on the **passage of time**. They all
> reuse the synthetic input symbol introduced in Session 1 — **`tick`** (a
> scheduled timer firing, or a notifier/duration observable emitting) — mixed
> with the ordinary source notifications. This is the largest family; it also
> reveals that the `*Time` operators are just **duration-selector machines with
> `timer(d)` wired in**.

Operators covered:

| Sub-family              | Operators                                        |
|-------------------------|--------------------------------------------------|
| Fixed delay             | `delay`, `delayWhen`                             |
| Sample (snapshot)       | `sampleTime`, `sample`                           |
| Silence window (lead/trail) | `throttle`, `auditTime`, `audit`             |
| Quiet period            | `debounce`                                       |
| Time buffering/windowing| `bufferTime`, `windowTime`                       |
| Metadata tagging        | `timestamp`, `timeInterval`                      |
| Watchdog                | `timeout`, `timeoutWith`                         |
| Scheduling              | `observeOn`, `subscribeOn`                       |

RxJS "`*Time` = selector machine with `timer`" relationships:

```text
delay(d)       = delayWhen(() => timer(d))
sampleTime(d)  = sample(interval(d))
auditTime(d)   = audit(() => timer(d))
throttleTime(d)= throttle(() => timer(d), config)   (see Session 1/2)
debounceTime(d)= debounce(() => timer(d))           (see Session 1)
timeoutWith(..)= timeout({ first|each, with })       (deprecated)
```

So Session 1 already modelled `debounceTime`/`throttleTime`; here we model the
**selector** generalizations and the remaining timing operators.

Common alphabet: `next(v)`, `complete`, `error(e)`, plus `tick` (duration/
notifier fired). Λ = `{ emit(x), complete, error(e), noop }`.

---

## Sub-family A — Fixed delay (`delay`, `delayWhen`)

### `delay(d)` — shift every value by `d`

Each value is held and re-emitted `d` later. State = a FIFO of pending
(value, dueTime) pairs.

- **Q** = `{ Delaying(queue), Done }`.

| # | State            | Input      | Guard          | Next / Output                         |
|---|------------------|------------|----------------|---------------------------------------|
| 1 | `Delaying(Q)`    | `next(v)`  | —              | enqueue `(v, now+d)`; `noop`          |
| 2 | `Delaying(Q)`    | `tick`     | head is due    | dequeue; `emit(head.v)`               |
| 3 | `Delaying(Q)`    | `complete` | —              | after queue drains: `complete` (completion is delayed too) |
| 4 | `Delaying(Q)`    | `error(e)` | —              | `error(e)` **immediately** (errors are NOT delayed) |

> Row 4 is the classic gotcha: `delay` postpones `next` and `complete` but
> **not** `error` — an error jumps the queue and fires at once.

### `delayWhen(durationSelector)`

Like `delay`, but each value's delay is the lifetime of a per-value **duration
observable** `durationSelector(v)`; the value emits when that observable first
emits (or completes). State holds one pending inner per value. Same skeleton as
`delay` with a dynamic due-time.

---

## Sub-family B — Sample (snapshot on tick) (`sampleTime`, `sample`)

Hold the **latest** source value; on each `tick` emit it **only if a new value
arrived since the previous tick**. `sampleTime(d)` ticks on `interval(d)`;
`sample(notifier)` ticks when `notifier` emits.

- **Q** = `{ Sampling(latest?, fresh: bool), Done }`.

| # | State                   | Input        | Guard         | Next / Output                    |
|---|-------------------------|--------------|---------------|----------------------------------|
| 1 | `Sampling(l, f)`        | `next(v)`    | —             | `Sampling(v, true)`; `noop`      |
| 2 | `Sampling(l, true)`     | `tick`       | fresh value   | `Sampling(l, false)`; `emit(l)`  |
| 3 | `Sampling(l, false)`    | `tick`       | no new value  | `Sampling(l, false)`; `noop`     |
| 4 | any                     | `complete`   | —             | `Done`; `complete`               |
| 5 | any                     | `error(e)`   | —             | `Done`; `error(e)`               |

> The `fresh` bit prevents re-emitting the same value twice: a `tick` with no
> intervening `next` is a no-op (Row 3). This is the difference from a naive
> "emit latest every tick".

---

## Sub-family C — Silence window (`throttle`, `auditTime`, `audit`)

All three open a **silence window** of some duration on a triggering value and
suppress other values during it. They differ in **which** value they emit:

| Operator  | Window opens on | Emits            | Session-1/2 analogue |
|-----------|-----------------|------------------|----------------------|
| `throttle`| first value (leading) | the **first** value | `throttleTime` |
| `audit`   | first value     | the **last** value of the window (trailing) | `throttleTime({trailing:true})` |
| `auditTime` | first value   | the last value   | `audit(() => timer(d))` |

### `audit(durationSelector)` — trailing silence window

- **Q** = `{ Open, Windowed(last), Done }`.

| # | State            | Input        | Guard  | Next / Output                              |
|---|------------------|--------------|--------|--------------------------------------------|
| 1 | `Open`           | `next(v)`    | —      | `Windowed(v)`; start duration; `noop`      |
| 2 | `Windowed(last)` | `next(w)`    | —      | `Windowed(w)`; `noop` (remember newest)    |
| 3 | `Windowed(last)` | `tick`       | —      | `Open`; `emit(last)` (trailing emit)       |
| 4 | any              | `complete`   | —      | flush pending `last` if any; `complete`    |
| 5 | any              | `error(e)`   | —      | `Done`; `error(e)`                          |

> Compare with `throttle`, whose Row 1 **emits immediately** (leading) and whose
> `tick` is silent. `audit` is the trailing dual — same window, opposite edge.
> This is exactly the `throttleTime` vs `throttleTime({trailing:true})`
> distinction from Sessions 1–2, now with a pluggable duration selector.

---

## Sub-family D — Quiet period (`debounce`)

`debounce(durationSelector)` — the selector generalization of `debounceTime`
(Session 1). Emit the latest value only after its duration observable fires with
no intervening source value; a new value **restarts** the duration. Same STT as
`debounceTime` with `tick` = "the per-value duration observable fired".

---

## Sub-family E — Time buffering / windowing (`bufferTime`, `windowTime`)

### `bufferTime(span)` — flush a buffer every `span` ms

Collect values into an array; emit the array on each timer tick, then reset.
Unlike `bufferCount` (flush on count), the boundary is **time**.

- **Q** = `{ Filling(buf), Done }`.

| # | State          | Input      | Next / Output                                   |
|---|----------------|------------|-------------------------------------------------|
| 1 | `Filling(buf)` | `next(v)`  | `Filling(buf+[v])`; `noop`                      |
| 2 | `Filling(buf)` | `tick`     | `Filling([])`; `emit(buf)` (even if empty → `[]`) |
| 3 | `Filling(buf)` | `complete` | `Done`; `emit(buf)` (final partial), `complete` |
| 4 | `Filling(buf)` | `error(e)` | `Done`; `error(e)`                              |

> Key contrast with `bufferCount`: `bufferTime` emits on the **clock**, so it
> can emit an **empty** buffer `[]` for a window with no values (Row 2).

### `windowTime(span)`

Identical boundary logic, but emits **nested Observables** instead of arrays:
each window is a live `Subject` that receives the values, closed on the tick.
Same STT shape; Λ emits observables, and each inner gets its own `next`/
`complete` stream.

---

## Sub-family F — Metadata tagging (`timestamp`, `timeInterval`)

Pure single-state projectors (like Session 3's `map`) whose λ attaches timing
metadata read from the scheduler clock.

### `timestamp()`

| # | State | Input     | Output                                   |
|---|-------|-----------|------------------------------------------|
| 1 | `Op`  | `next(v)` | `emit({ value: v, timestamp: now })`     |

### `timeInterval()`

Stateful by one number — the time of the previous emission:

| # | State         | Input     | Output                                            |
|---|---------------|-----------|---------------------------------------------------|
| 1 | `Prev(t0)`    | `next(v)` | `emit({ value: v, interval: now - t0 })`; `t0:=now` |

> `timestamp` is stateless (absolute clock read); `timeInterval` keeps the
> previous timestamp to compute deltas — a one-number accumulator, like a
> numeric `pairwise`.

---

## Sub-family G — Watchdog (`timeout`, `timeoutWith`)

`timeout({ first, each, with })` arms a timer that must be "fed" by source
activity. If no value arrives within the deadline, it errors (`TimeoutError`) or
switches to a fallback observable (`with`).

- **Q** = `{ Armed(deadline), Done }`. Each source `next` **resets** the timer
  (`each`); the very first deadline can differ (`first`).

| # | State           | Input      | Guard                | Next / Output                               |
|---|-----------------|------------|----------------------|---------------------------------------------|
| 1 | `Armed(t)`      | `next(v)`  | before deadline      | `Armed(now+each)`; `emit(v)` (reset timer)  |
| 2 | `Armed(t)`      | `tick`     | deadline reached     | no `with`: `error(TimeoutError)` → `Done`   |
| 3 | `Armed(t)`      | `tick`     | deadline, has `with` | switch to `with(info)` observable (mirror it)|
| 4 | `Armed(t)`      | `complete` | —                    | `Done`; `complete`                          |
| 5 | `Armed(t)`      | `error(e)` | —                    | `Done`; `error(e)`                          |

> The watchdog is a timer that races the source: every value that arrives in
> time (Row 1) re-arms it; a `tick` that wins the race (Row 2/3) fires the
> timeout. `timeoutWith(due, fallback)` is the deprecated 2-arg form of Row 3.

---

## Sub-family H — Scheduling (`observeOn`, `subscribeOn`)

These change **when/where** work runs, not **what** is emitted — so as value
machines they are the **identity** (`λ = emit(v)` on every `next`, forward all
terminals). The only effect is a re-scheduling of each notification:

- `observeOn(scheduler)` — re-schedules each **outgoing** notification onto
  `scheduler` (can introduce a frame of delay in virtual time).
- `subscribeOn(scheduler)` — schedules the **subscription** itself onto
  `scheduler` (delays when the source is subscribed).

Their STT is `map`'s identity STT; the test interest is purely the **frame
shift** the scheduler introduces, verified with the TestScheduler.

> **Oracle note.** Inside `TestScheduler.run()`, `observeOn(asyncScheduler)` and
> `subscribeOn(asyncScheduler)` add **no** virtual-time delay — the frames are
> unchanged, confirming these are pure identity value machines (the scheduling
> effect is about *where* work runs, not *when* in virtual time). Also
> oracle-confirmed: `delay(d)` delays the **completion** too, but `delayWhen`
> does **not** further delay completion — the final value and completion land on
> the same frame once the last per-value duration resolves.

---

## From STT rows to test cases

Each operator (or close pair) has a test file (`tests/60-*` … `tests/70-*`).
Time-driven tests use the `d`/`span` durations written in marble `NNms` form;
the key behaviours pinned down: `delay` shifts values but not errors;
`sample`/`sampleTime` skip ticks with no fresh value; `audit` emits the
**trailing** value (vs `throttle`'s leading); `bufferTime` emits `[]` for empty
windows; `timeout` fires on the deadline and can switch to a fallback. As always
the TestScheduler is the oracle for exact frames.
