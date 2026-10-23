# Session 7 — Combination Operators as Mealy Machines

> 14 operators that merge **N input streams** into one. This generalises
> Session 2's `withLatestFrom` (which had exactly two input alphabets, one of
> them "sampled") to arbitrary N, and classifies the strategies by the **shape
> of state** each must keep.

Operators covered:

| Strategy       | Static / `project`  | `*With` (pipeable) | `*All` (higher-order) |
|----------------|---------------------|--------------------|-----------------------|
| latest-slots   | `combineLatest`     | `combineLatestWith`| `combineLatestAll` / `combineAll` |
| per-source queue | `zip`             | `zipWith`          | `zipAll`              |
| sequential     | `concat`            | `concatWith`       | —                     |
| interleave     | `merge`             | `mergeWith`        | —                     |
| winner-lock    | `race`              | `raceWith`         | —                     |

Plus a **revisit of `withLatestFrom`** as the asymmetric cousin of
`combineLatest`.

RxJS relationships (so we model one machine per strategy):

```text
combineLatestWith(...o) = combineLatest(source, ...o)
zipWith(...o)           = zip(source, ...o)
concatWith(...o)        = concat(source, ...o)
mergeWith(...o)         = merge(source, ...o)
raceWith(...o)          = race(source, ...o)
combineAll()            = combineLatestAll()           (deprecated alias)
combineLatestAll/zipAll = joinAllInternals(combineLatest/zip)  -- flatten a
                          higher-order source, then combine on outer-complete
```

Input alphabet (N sources, tagged by origin `i`):
`next_i(v)`, `complete_i`, `error_i(e)`. Output Λ = `{ emit(x), complete,
error(e), noop }`. Any `error_i` tears everything down (shared across all five).

---

## Strategy A — latest-slots (`combineLatest`)

Keep the **latest value of each source**. Emit a combined array **every time any
source emits**, but only once **all** sources have emitted at least once.

- **Q** = `{ Priming(have ⊆ sources, latest[]), Emitting(latest[]), Done }`.
  `have` tracks which sources have produced a first value; once `|have| = N`
  the machine moves to `Emitting`.

| # | State              | Input           | Guard                    | Next / Output                         |
|---|--------------------|-----------------|--------------------------|---------------------------------------|
| 1 | `Priming(H, L)`    | `next_i(v)`     | `H ∪ {i} ≠ all`          | `Priming(H∪{i}, L[i:=v])`; `noop`     |
| 2 | `Priming(H, L)`    | `next_i(v)`     | `H ∪ {i} = all` (last one)| `Emitting(L[i:=v])`; `emit([...L])`  |
| 3 | `Emitting(L)`      | `next_i(v)`     | —                        | `Emitting(L[i:=v])`; `emit([...L])`   |
| 4 | any                | `complete_i`    | other sources still live | stay; `noop` (one source done ≠ all)  |
| 5 | any                | all completed   | —                        | `Done`; `complete`                    |
| 6 | any                | `error_i(e)`    | —                        | `Done`; `error(e)`                    |

> Row 2 is the gate: **nothing is emitted until every source has spoken once**.
> A source that completes **without ever emitting** makes the whole result
> complete with no emission (it can never fill its slot). Row 4 shows a single
> source completing does not end the output — `combineLatest` keeps using that
> source's last value.

### `withLatestFrom` revisited — the asymmetric combineLatest

Same latest-slot state, but **only the primary (source) emission triggers
output**; the others are purely sampled. In combineLatest *every* source
triggers (Row 3); in withLatestFrom only `source` does. That one-line change to
λ is the whole difference — see `docs/08-withLatestFrom.md` for its dedicated
STT.

---

## Strategy B — per-source queue (`zip`)

Emit the i-th combined tuple only when **every** source has produced its i-th
value. State = one FIFO queue per source; emit (and dequeue one from each) when
all queues are non-empty.

- **Q** = `{ Zipping(q[0..N-1]), Done }`.

| # | State            | Input         | Guard                           | Next / Output                              |
|---|------------------|---------------|---------------------------------|--------------------------------------------|
| 1 | `Zipping(Q)`     | `next_i(v)`   | some other queue empty          | enqueue `v` into `Q[i]`; `noop`            |
| 2 | `Zipping(Q)`     | `next_i(v)`   | all queues non-empty after push | dequeue one from each; `emit([...])`       |
| 3 | `Zipping(Q)`     | `complete_i`  | `Q[i]` empty                    | `Done`; `complete` (a drained source ends zip) |
| 4 | `Zipping(Q)`     | `complete_i`  | `Q[i]` non-empty                | stay; may still emit pending tuples        |
| 5 | any              | `error_i(e)`  | —                               | `Done`; `error(e)`                         |

> Zip pairs **by index**, so a fast source buffers ahead while waiting for a
> slow one. Row 3 is the key terminator: once any source completes **and its
> queue is empty**, no further tuples are possible, so zip completes.

---

## Strategy C — sequential (`concat`) and interleave (`merge`)

Both flatten N sources with **no per-value combination** — they forward values
as-is. They differ only in subscription policy (exactly the concat-vs-merge
split from Session 6, but over a *fixed* list of sources rather than a dynamic
one).

### `concat(...sources)` — one at a time, in order

- **Q** = `{ Active(k) : running source k, Done }`, `q₀ = Active(0)`.

| # | State        | Input            | Next / Output                               |
|---|--------------|------------------|---------------------------------------------|
| 1 | `Active(k)`  | `next_k(v)`      | `emit(v)`                                    |
| 2 | `Active(k)`  | `complete_k`     | if `k+1 < N`: `Active(k+1)` (subscribe next); else `Done`, `complete` |
| 3 | `Active(k)`  | `error_k(e)`     | `Done`; `error(e)`                           |

> Only source `k` is subscribed at a time; sources `k+1…` haven't started yet.
> If an early source **never completes**, later sources never run.

### `merge(...sources, concurrent?)` — all at once, interleaved

- **Q** = `{ Running(doneCount), Done }`; subscribe all (up to `concurrent`).

| # | State             | Input          | Guard               | Next / Output                    |
|---|-------------------|----------------|---------------------|----------------------------------|
| 1 | `Running(d)`      | `next_i(v)`    | —                   | `emit(v)` (interleaved by time)  |
| 2 | `Running(d)`      | `complete_i`   | `d+1 < N`           | `Running(d+1)`; `noop`           |
| 3 | `Running(d)`      | `complete_i`   | `d+1 = N`           | `Done`; `complete`               |
| 4 | any               | `error_i(e)`   | —                   | `Done`; `error(e)`               |

> `merge` completes only when **all** sources have completed (Row 3). `concat`
> is `merge` with `concurrent = 1` **and** ordering preserved — the same
> relationship as `concatMap`/`mergeMap` in Session 6.

---

## Strategy D — winner-lock (`race`)

Subscribe to all sources; the **first** one to emit wins. All others are
immediately unsubscribed, and the output thereafter mirrors the winner.

- **Q** = `{ Racing(candidates), Locked(winner), Done }`, `q₀ = Racing(all)`.

| # | State              | Input           | Next / Output                                  |
|---|--------------------|-----------------|------------------------------------------------|
| 1 | `Racing(C)`        | `next_i(v)`     | unsubscribe all `≠ i`; `Locked(i)`; `emit(v)`  |
| 2 | `Racing(C)`        | `error_i(e)`    | `Done`; `error(e)` (an erroring candidate loses the race by failing it) |
| 3 | `Locked(w)`        | `next_w(v)`     | `Locked(w)`; `emit(v)` (mirror the winner)     |
| 4 | `Locked(w)`        | `complete_w`    | `Done`; `complete`                             |
| 5 | `Locked(w)`        | `error_w(e)`    | `Done`; `error(e)`                             |

> Row 1 is the lock: the first **emission** (not the first subscription) decides
> the winner, and the losers are torn down. After locking, `race` is a pure
> pass-through of the winner (Rows 3–5).

---

## Higher-order `*All` variants

`combineLatestAll` / `zipAll` take a **source of Observables**, collect them all
(via `joinAllInternals`) until the outer completes, then apply
`combineLatest` / `zip` to the collected list. So their machine is a two-phase
one: **Phase 1** buffer inner observables (output `noop`); **Phase 2** on outer
`complete`, run the latest-slot / per-queue machine over the buffered list.
`combineAll` is the deprecated alias of `combineLatestAll`.

---

## From STT rows to test cases

> **Marble-syntax note (learned here).** A synchronous group `(xy)` advances the
> TestScheduler's virtual clock by its **full character count including the
> parentheses** — `(xy)` consumes 4 frames, not 2. When two outputs share a
> frame, prefer staggering the inputs so each output lands on its own frame
> (cleaner marbles), or account for the 4-frame span when a group is
> unavoidable. Several Session-7 tests use staggered inputs for exactly this
> reason.

Each strategy has a test file (`tests/55-*` … `tests/59-*`). The two-source
marble tests are chosen so the strategy's signature behaviour is unmistakable:
`combineLatest` shows the "wait for both, then re-emit on any change" pattern;
`zip` shows index-pairing with a buffered fast source; `concat` shows strict
ordering; `merge` shows time-interleave; `race` shows the loser being dropped
after the winner's first emission. Each `it(...)` is annotated with its STT row.
