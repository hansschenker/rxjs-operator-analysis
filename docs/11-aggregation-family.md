# Session 5 — Distinctness, Existence & Aggregation as Mealy Machines

> 14 operators that either remember what they have seen (distinctness),
> short-circuit on a deciding value (existence), fold the whole stream into one
> value (aggregation), or bracket the stream with extra values
> (prepend/append).
>
> **This file is the family overview.** Each operator also has its own dedicated
> analysis in [`docs/operators/`](operators/README.md):
> [`distinct`](operators/distinct.md) ·
> [`distinctUntilKeyChanged`](operators/distinctUntilKeyChanged.md) ·
> [`every`](operators/every.md) · [`find`](operators/find.md) ·
> [`findIndex`](operators/findIndex.md) · [`isEmpty`](operators/isEmpty.md) ·
> [`count`](operators/count.md) · [`max`](operators/max.md) ·
> [`min`](operators/min.md) · [`toArray`](operators/toArray.md) ·
> [`sequenceEqual`](operators/sequenceEqual.md) ·
> [`throwIfEmpty`](operators/throwIfEmpty.md) ·
> [`startWith`](operators/startWith.md) · [`endWith`](operators/endWith.md).

Operators covered:

| Sub-family               | Operators                                              |
|--------------------------|--------------------------------------------------------|
| Distinctness (set/key)   | `distinct`, `distinctUntilKeyChanged`                  |
| Short-circuit existence  | `every`, `find`, `findIndex`, `isEmpty`                |
| Emit-on-complete folds   | `count`, `max`, `min`, `toArray`, `sequenceEqual`, `throwIfEmpty` |
| Bracketing               | `startWith`, `endWith`                                 |

Common alphabet unless noted:

- **Σ** = `{ next(v), complete, error(e) }` (+ a `flush`/second-stream symbol
  for `distinct` with `flushes` and `sequenceEqual`).
- **Λ** = `{ emit(x), complete, error(e), noop }`.

A recurring theme: the **fold** operators (`count`/`max`/`min`/`toArray`/
`sequenceEqual`) accumulate silently and emit a **single** value on the
completion edge — the same "output lives on the `complete` edge" shape as
`reduce` from Session 3. The **existence** operators invert this with a
**short-circuit**: they can emit *before* completion the moment the outcome is
decided.

---

## Sub-family A — Distinctness

### `distinct(keySelector?, flushes?)` — the seen-set machine

Emit a value only if its key has **never** been seen before (global
de-duplication, unlike `distinctUntilChanged`'s *consecutive*-only check).

- **Q** = `{ Tracking(seen), Done }` where `seen` is a `Set` of keys; `q₀ =
  Tracking(∅)`.
- Optional `flushes` observable adds a `flush` input symbol that empties `seen`.

| # | State            | Input        | Guard                   | Next state              | Output   |
|---|------------------|--------------|-------------------------|-------------------------|----------|
| 1 | `Tracking(S)`    | `next(v)`    | `key(v) ∉ S`            | `Tracking(S ∪ {key(v)})`| `emit(v)`|
| 2 | `Tracking(S)`    | `next(v)`    | `key(v) ∈ S`            | `Tracking(S)`           | `noop`   |
| 3 | `Tracking(S)`    | `flush`      | (flushes stream emits)  | `Tracking(∅)`           | `noop`   |
| 4 | `Tracking(S)`    | `complete`   | —                       | `Done`                  | `complete`|
| 5 | `Tracking(S)`    | `error(e)`   | —                       | `Done`                  | `error(e)`|

> Rows 1 vs 2 are the guarded fork on set membership; this is the defining
> difference from `distinctUntilChanged`, whose state was a *single* previous
> value, not a growing set. The `flush` symbol (Row 3) is the memory-leak escape
> hatch.

### `distinctUntilKeyChanged(key, comparator?)`

`distinctUntilChanged` where the comparator runs on `value[key]` instead of the
whole value. Same two-state machine as Session 1's `distinctUntilChanged`
(`S0` bootstrap + `S1(p)`), with the guard specialised to compare the chosen
property. We reuse that STT; the only change is `cmp(p[key], v[key])`.

---

## Sub-family B — Short-circuit existence

These decide the answer the moment a *deciding* value arrives, emit it
immediately, and complete — they do **not** wait for source completion unless
the outcome is "nothing decided it".

### `every(predicate)` — universal quantifier

| # | State  | Input      | Guard          | Next   | Output                    |
|---|--------|------------|----------------|--------|---------------------------|
| 1 | `Open` | `next(v)`  | `p(v,i)=true`  | `Open` | `noop` (still all-true)   |
| 2 | `Open` | `next(v)`  | `p(v,i)=false` | `Done` | `emit(false)`, `complete` (short-circuit!) |
| 3 | `Open` | `complete` | —              | `Done` | `emit(true)`, `complete` (vacuously true if empty) |
| 4 | `Open` | `error(e)` | —              | `Done` | `error(e)`                |

> Row 2 is the short-circuit: the first failing value decides `false` right away.
> Row 3 shows an empty source yields `true` (vacuous truth).

### `find(predicate)` / `findIndex(predicate)` — existential quantifier

| # | State        | Input      | Guard          | Next   | Output                         |
|---|--------------|------------|----------------|--------|--------------------------------|
| 1 | `Search(i)`  | `next(v)`  | `p(v,i)=false` | `Search(i+1)` | `noop`                  |
| 2 | `Search(i)`  | `next(v)`  | `p(v,i)=true`  | `Done` | `emit(v)` / `emit(i)`, `complete` |
| 3 | `Search(i)`  | `complete` | —              | `Done` | `emit(undefined)` / `emit(-1)`, `complete` |
| 4 | `Search(i)`  | `error(e)` | —              | `Done` | `error(e)`                     |

> `find` emits the **value** (or `undefined` if none); `findIndex` emits the
> **index** (or `-1`). Identical machine, two output projections — another clean
> "same δ, different λ" pair.

### `isEmpty()` — the 1-bit existence check

| # | State  | Input      | Next   | Output                       |
|---|--------|------------|--------|------------------------------|
| 1 | `Open` | `next(v)`  | `Done` | `emit(false)`, `complete` (short-circuit on first value) |
| 2 | `Open` | `complete` | `Done` | `emit(true)`, `complete`     |
| 3 | `Open` | `error(e)` | `Done` | `error(e)`                   |

> The mirror of `every`: the *first value* decides `false`; completion with no
> value decides `true`.

---

## Sub-family C — Emit-on-complete folds

Accumulate silently; emit exactly one value on the completion edge. All share
`reduce`'s shape (Session 3) — only the accumulator and seed differ.

### `count(predicate?)`

`reduce((total, v, i) => total + (predicate ? (predicate(v,i)?1:0) : 1), 0)`.
Single-state `Accum(n)`; Row 1 `next` → `noop`, increment on match; `complete`
→ `emit(n)`.

### `max(comparer?)` / `min(comparer?)`

`reduce` keeping the running extreme. State `Accum(best?)`; first value seeds
`best`; `complete` emits `best`. Empty source → completes with **no** emission
(like seedless `reduce`).

| # | State          | Input      | Guard            | Next            | Output          |
|---|----------------|------------|------------------|-----------------|-----------------|
| 1 | `Accum(∅)`     | `next(v)`  | —                | `Accum(v)`      | `noop` (seed)   |
| 2 | `Accum(b)`     | `next(v)`  | `v` beats `b`    | `Accum(v)`      | `noop`          |
| 3 | `Accum(b)`     | `next(v)`  | `v` not better   | `Accum(b)`      | `noop`          |
| 4 | `Accum(b)`     | `complete` | saw ≥1           | `Done`          | `emit(b)`, `complete` |
| 5 | `Accum(∅)`     | `complete` | empty            | `Done`          | `complete` (no value) |

### `toArray()`

`reduce` collecting into an array, seed `[]`. **Always emits** on completion
(even for an empty source → emits `[]`). That is the key contrast with
`max`/`min`: `toArray` has a seed, so the empty case emits `[]` rather than
nothing.

| # | State        | Input      | Next          | Output              |
|---|--------------|------------|---------------|---------------------|
| 1 | `Accum(arr)` | `next(v)`  | `Accum(arr+[v])` | `noop`           |
| 2 | `Accum(arr)` | `complete` | `Done`        | `emit(arr)`, `complete` |
| 3 | `Accum(arr)` | `error(e)` | `Done`        | `error(e)`          |

### `sequenceEqual(compareTo, comparator?)` — dual-queue comparison

Compares the source against a second observable value-by-value; emits a single
`boolean` on completion. Needs **two queues** (one per stream) and a
mismatch/length check.

- **Q** = `{ Comparing(qa, qb, aDone, bDone), Done }`.

| # | State                     | Input (either stream)   | Guard                 | Next / Output                              |
|---|---------------------------|-------------------------|-----------------------|--------------------------------------------|
| 1 | `Comparing(..)`           | `aNext(x)` / `bNext(y)` | counterpart queue empty| enqueue; `noop`                           |
| 2 | `Comparing(..)`           | a/b next, pair available| `cmp(x,y)=true`       | dequeue both; `noop`                       |
| 3 | `Comparing(..)`           | a/b next, pair available| `cmp(x,y)=false`      | `emit(false)`, `complete` (short-circuit)  |
| 4 | `Comparing(..)`           | both complete           | queues drained equal  | `emit(true)`, `complete`                   |
| 5 | `Comparing(..)`           | one completes, lengths differ | —               | `emit(false)`, `complete`                  |
| 6 | any                       | `error(e)`              | —                     | `error(e)`                                 |

> A mismatch (Row 3) short-circuits to `false`; otherwise the verdict waits for
> both to complete. This is the session's most state-heavy machine — two FIFO
> queues plus two done-flags.
>
> **Oracle-confirmed short-circuit timing.** The `false` verdict is emitted the
> moment it is *decidable*, not at source completion: a value mismatch fires as
> soon as both counterparts are available (e.g. frame 3 for a mismatch on the
> 2nd pair), and a length surplus fires as soon as the extra value arrives after
> the shorter stream has drained (frame 5, not the source's completion frame 6).
> Only the `true` verdict must wait for both streams to complete (Row 4).

### `throwIfEmpty(errorFactory?)`

Covered structurally in Session 4 (it powers `first`/`last`/`elementAt`): a
one-bit `hasValue` latch; on `complete` with no value, `error(factory())`
(default `EmptyError`) instead of completing. Re-stated here because it is the
error-raising sibling of `defaultIfEmpty` and belongs to the existence cluster.

---

## Sub-family D — Bracketing

### `startWith(...values)` — prepend on subscribe

Emit the given values immediately on subscription, **before** anything from the
source, then behave as identity.

- **Q** = `{ Priming, Flowing, Done }`, `q₀ = Priming`.

| # | State      | Input (incl. subscribe) | Next      | Output                         |
|---|------------|-------------------------|-----------|--------------------------------|
| 0 | `Priming`  | subscribe               | `Flowing` | `emit(v0) … emit(vk)` (the prepended values) |
| 1 | `Flowing`  | `next(v)`               | `Flowing` | `emit(v)` (identity)           |
| 2 | `Flowing`  | `complete`              | `Done`    | `complete`                     |
| 3 | `Flowing`  | `error(e)`              | `Done`    | `error(e)`                     |

### `endWith(...values)` — append on complete

`concat(source, of(...values))`: pass the source through; on source completion
emit the appended values, **then** complete.

| # | State      | Input      | Next      | Output                                   |
|---|------------|------------|-----------|------------------------------------------|
| 1 | `Flowing`  | `next(v)`  | `Flowing` | `emit(v)`                                |
| 2 | `Flowing`  | `complete` | `Done`    | `emit(w0) … emit(wk)`, then `complete`   |
| 3 | `Flowing`  | `error(e)` | `Done`    | `error(e)` (appended values NOT emitted) |

> `startWith` adds values on the *subscribe* edge; `endWith` adds them on the
> *complete* edge. A clean prepend/append pair, and Row 3 shows that an errored
> source skips the `endWith` tail entirely.
>
> **Oracle note on timing.** `startWith` emits its prepended values
> synchronously at the subscribe frame (frame 0) and does **not** time-shift the
> source — the source keeps its own frames. In marble tests a multi-value
> prepend becomes a synchronous group `(xy)` at frame 0, which is why a cleaner
> single-value prepend (`x`) is used when the source timeline must line up
> char-by-char.

---

## From STT rows to test cases

Each operator has a test file (`tests/35-*` … `tests/48-*`), every `it(...)`
annotated with its STT row. Short-circuit operators (`every`, `find`,
`isEmpty`, `sequenceEqual`) get an explicit "decides before completion" case;
the fold operators get the empty-source contrast (`toArray` → `[]`, `max`/`min`
→ nothing); `distinct` gets a global-dedup case and a `flushes` case.
