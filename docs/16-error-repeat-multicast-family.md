# Session 10 — Error Handling, Repetition & Multicasting as Mealy Machines

> The final 17 operators. Three clusters: **error recovery** (catch / resume /
> finalize), **resubscription loops** (retry / repeat — the source becomes a
> *restartable* sub-machine), and **multicasting** (one shared-subscription
> skeleton parameterised by a Subject type and a connect policy). Plus the
> `flatMap` alias of `mergeMap`.
>
> **This file is the family overview.** Each operator also has its own dedicated
> analysis in [`docs/operators/`](operators/README.md):
> [`catchError`](operators/catchError.md) ·
> [`onErrorResumeNextWith`](operators/onErrorResumeNextWith.md) ·
> [`finalize`](operators/finalize.md) · [`retry`](operators/retry.md) ·
> [`repeat`](operators/repeat.md) · [`retryWhen`](operators/retryWhen.md) ·
> [`repeatWhen`](operators/repeatWhen.md) · [`flatMap`](operators/flatMap.md) ·
> [`share`](operators/share.md) · [`shareReplay`](operators/shareReplay.md) ·
> [`connect`](operators/connect.md) · [`multicast`](operators/multicast.md) ·
> [`refCount`](operators/refCount.md) · [`publish`](operators/publish.md) ·
> [`publishBehavior`](operators/publishBehavior.md) ·
> [`publishReplay`](operators/publishReplay.md) ·
> [`publishLast`](operators/publishLast.md).

Operators covered:

| Cluster            | Operators                                                      |
|--------------------|----------------------------------------------------------------|
| Error recovery     | `catchError`, `onErrorResumeNextWith`, `finalize`              |
| Resubscription loop| `retry`, `retryWhen`, `repeat`, `repeatWhen`                   |
| Alias              | `flatMap` (= `mergeMap`, Session 6)                            |
| Multicasting       | `connect`, `multicast`, `refCount`, `share`, `shareReplay`, `publish`, `publishBehavior`, `publishLast`, `publishReplay` |

Common alphabet: `next(v)`, `complete`, `error(e)`, plus (for retry/repeat) a
**resubscribe** meta-event and (for multicast) **subscriber count** changes.

---

## Cluster A — Error recovery

### `catchError(selector)` — swap to a fallback on error

On `error`, call `selector(err, caught)` and **subscribe to its result**,
mirroring that observable instead of failing.

- **Q** = `{ Primary, Caught, Done }`, `q₀ = Primary`.

| # | State      | Input      | Next / Output                                   |
|---|------------|------------|-------------------------------------------------|
| 1 | `Primary`  | `next(v)`  | `Primary`; `emit(v)`                            |
| 2 | `Primary`  | `complete` | `Done`; `complete`                              |
| 3 | `Primary`  | `error(e)` | subscribe `selector(e)`; `Caught`; `noop`       |
| 4 | `Caught`   | `next(v)`  | `Caught`; `emit(v)` (from the fallback)         |
| 5 | `Caught`   | `complete` | `Done`; `complete`                              |
| 6 | `Caught`   | `error(e)` | `Done`; `error(e)` (fallback itself failed)     |

> Row 3 is the recovery edge: the **error notification is consumed**, replaced
> by a subscription to the fallback. If the selector returns the source itself,
> `catchError` becomes an (uncounted) retry.

### `onErrorResumeNextWith(...sources)` — move on, swallowing errors

Run each source in turn; when one **errors OR completes**, quietly move to the
next; when the list is exhausted, complete. Errors never reach the output.

| # | State        | Input         | Next / Output                               |
|---|--------------|---------------|---------------------------------------------|
| 1 | `Active(k)`  | `next(v)`     | `emit(v)`                                    |
| 2 | `Active(k)`  | `complete_k`  | `k+1<N`: `Active(k+1)`; else `Done`,`complete` |
| 3 | `Active(k)`  | `error_k(e)`  | **same as complete** — advance to next source; error swallowed |

> The distinctive edge is Row 3: unlike every other operator so far, an error is
> treated *exactly like* completion (advance, don't propagate). It is `concat`
> that is immune to errors.

### `finalize(callback)` — teardown edge

Identity value machine with one extra guarantee: run `callback` on **any**
termination (complete, error, or unsubscription).

| # | State  | Input       | Output                                   |
|---|--------|-------------|------------------------------------------|
| 1 | `Op`   | `next(v)`   | `emit(v)`                                |
| 2 | `Op`   | `complete`  | run callback; `complete`                 |
| 3 | `Op`   | `error(e)`  | run callback; `error(e)`                 |
| 4 | `Op`   | unsubscribe | run callback (teardown)                  |

> The callback fires on the transition **into** the terminal/torn-down state —
> a Mealy "exit action" attached to every edge leaving `Op`. It never changes Λ.

---

## Cluster B — Resubscription loops

Here the **source itself is a restartable sub-machine**. The operator's state
counts attempts; the meta-event `resubscribe` re-runs the source from scratch.

### `retry({ count })` — restart on error

| # | State          | Input      | Guard            | Next / Output                              |
|---|----------------|------------|------------------|--------------------------------------------|
| 1 | `Trying(k)`    | `next(v)`  | —                | `Trying(k)`; `emit(v)`                     |
| 2 | `Trying(k)`    | `complete` | —                | `Done`; `complete`                         |
| 3 | `Trying(k)`    | `error(e)` | `k < count`      | **resubscribe source**; `Trying(k+1)`; `noop` |
| 4 | `Trying(k)`    | `error(e)` | `k = count`      | `Done`; `error(e)` (retries exhausted)     |

> Row 3 is the loop edge: on error, if attempts remain, the source is
> **re-subscribed** (re-run) and already-emitted values are re-emitted. `retry()`
> with no count loops forever on error.

### `repeat({ count })` — restart on complete (the dual)

Identical machine with the loop on **`complete`** instead of `error`:

| # | State          | Input      | Guard          | Next / Output                              |
|---|----------------|------------|----------------|--------------------------------------------|
| 1 | `Running(k)`   | `next(v)`  | —              | `Running(k)`; `emit(v)`                    |
| 2 | `Running(k)`   | `complete` | `k < count`    | **resubscribe**; `Running(k+1)`; `noop`    |
| 3 | `Running(k)`   | `complete` | `k = count`    | `Done`; `complete`                         |
| 4 | `Running(k)`   | `error(e)` | —              | `Done`; `error(e)`                         |

> `retry` loops on error / passes complete; `repeat` loops on complete / passes
> error. Same FSM, the two terminal edges swapped — a clean duality.

### `retryWhen(notifier)` / `repeatWhen(notifier)`

Same loops, but whether to resubscribe is decided by a **notifier observable**:
the error/complete is fed to `notifier`, and the source resubscribes only when
the notifier emits (and terminates when the notifier completes/errors). This
promotes the guard in Row 3/2 from a counter to an external signal — the
notifier-driven generalisation (like `*Until` in Session 4).

---

## Cluster C — Multicasting (one skeleton, parameterised)

A **unicast** (cold) source runs once per subscriber. **Multicast** inserts a
`Subject` between the source and the subscribers so **one** source subscription
feeds **many** consumers. The whole cluster is that one idea, parameterised by
**(a) which Subject** and **(b) when to connect/disconnect**.

### The shared multicast skeleton

- **Q** = `{ Cold (0 subscribers, source not running),
  Hot(refCount, subject), Done }`.

| # | State              | Input                 | Next / Output                               |
|---|--------------------|-----------------------|---------------------------------------------|
| 1 | `Cold`             | first subscriber      | create subject; subscribe source; `Hot(1)`  |
| 2 | `Hot(n)`           | new subscriber        | `Hot(n+1)`; replay-or-not per subject type   |
| 3 | `Hot(n)`           | source `next(v)`      | subject.next(v) → fan out `emit(v)` to all   |
| 4 | `Hot(n)`           | subscriber leaves     | `Hot(n-1)`; if `n-1=0` maybe disconnect       |
| 5 | `Hot(n)`           | source `complete`/`error` | forward to all; terminal per reset policy |

### The Subject parameter (what late subscribers see)

| Operator          | Subject type      | Late subscriber sees                       |
|-------------------|-------------------|--------------------------------------------|
| `publish`         | `Subject`         | only values emitted **after** they join    |
| `publishBehavior(x)` | `BehaviorSubject(x)` | the latest value (or seed `x`)         |
| `publishReplay(n)`| `ReplaySubject(n)`| the last `n` values replayed               |
| `publishLast`     | `AsyncSubject`    | only the final value, on complete          |
| `shareReplay(n)`  | `ReplaySubject(n)`| the last `n` (auto ref-counted)            |

### The connect-policy parameter (when the source runs)

- **`connect`** — the modern primitive: run a `selector` with the multicast
  subject, you control the shape; connects for the duration of the result.
- **`multicast(subjectFactory)`** — returns a `ConnectableObservable`; the
  source does **not** run until you call `.connect()` (manual), or wrap with
  `refCount`.
- **`refCount()`** — turns a `ConnectableObservable` hot on the **first**
  subscriber and disconnects on the **last** (Rows 1 & 4 automated).
- **`publish*`** = `multicast(() => <that subject>)` — the deprecated shortcuts.
- **`share(config)`** — the modern all-in-one: ref-counted multicast with
  configurable reset-on-complete / reset-on-error / reset-on-refcount-zero.
- **`shareReplay`** = `share({ connector: () => new ReplaySubject(...) })`.

> So the nine multicast operators are **one state machine** (Cold ⇄ Hot by
> reference count) with two knobs: *which Subject* (Row 2's replay behaviour)
> and *when to connect* (Rows 1/4's automation). `connect`/`share` are the
> modern faces; `multicast`/`publish*`/`refCount` are the classic plumbing.

---

## From STT rows to test cases

Each operator (or close pair) has a test file (`tests/74-*` … `tests/80-*`).
Error tests show `catchError` swapping to a fallback and `onErrorResumeNextWith`
swallowing errors; `finalize` asserts the callback fires on both complete and
error; `retry`/`repeat` show the resubscription loop with a counted bound;
`flatMap` is verified to behave identically to `mergeMap`; the multicast tests
use a shared `cold` source and multiple subscribers to prove **one** source
subscription feeds many consumers, with `publishBehavior`/`shareReplay` showing
late-subscriber replay. Every `it(...)` is annotated with its STT row.
