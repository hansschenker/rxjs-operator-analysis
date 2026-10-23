# Roadmap: Mealy-Machine Analysis of All RxJS 7.x Operators

Source of truth: the operator files in
[`ReactiveX/rxjs @ 7.x /src/internal/operators`](https://github.com/ReactiveX/rxjs/tree/7.x/src/internal/operators).

**Scope.** The directory holds 120 `.ts` files. Four are internal plumbing, not
operators, and are **excluded**:

- `OperatorSubscriber.ts`, `mergeInternals.ts`, `scanInternals.ts`,
  `joinAllInternals.ts`

That leaves **116 public operators** to analyze. Each gets the full pipeline:
**6-tuple (Q, Σ, Λ, δ, λ, q₀) → STD (Mermaid) → STT → one marble test per STT
row.**

Batches are grouped by **behavioral family** so each session reinforces a
shared state-machine shape.

---

## Progress

- [x] **Session 1** — Foundations (stateful & time) — *4 operators* — DONE
- [x] **Session 2** — Tuples, buffering & dual-source — *4 operators* — DONE
- [x] **Session 3** — Transformation / map family — *12 operators* — DONE
- [x] **Session 4** — Filtering & conditional emission — *14 operators* — DONE
- [x] **Session 5** — Distinctness, existence & aggregation — *14 operators* — DONE
- [x] **Session 6** — Higher-order flattening — *12 operators* — DONE
- [x] **Session 7** — Combination operators — *14 operators* — DONE
- [x] **Session 8** — Time-based operators — *16 operators* — DONE
- [x] **Session 9** — Buffering & windowing — *9 operators* — DONE
- [ ] Session 10 — see below — *17 operators remaining*

Running total when complete: 4 + 4 + 12 + 14 + 14 + 12 + 14 + 16 + 9 + 17 = **116**
tickets, covering the **113** distinct public operator files (a few names —
`withLatestFrom`, `scan` seedless — are cross-session revisits, not separate
files; and the deprecated `flatMap` alias of `mergeMap` is picked up in S10).

---

## Session 1 — Foundations: stateful & time-based (DONE, 4)

`scan`, `distinctUntilChanged`, `debounceTime`, `throttleTime`

> Established the method: accumulator state, bootstrap state + guard, and time
> as an input symbol (`tick`).

## Session 2 — Tuples, counting buffers & dual-source (TODAY, 4)

`throttleTime({ trailing: true })` (config variant), `pairwise`, `bufferCount`,
`withLatestFrom`

> Carry-a-pending-value on a timer edge; clean two-state tuple bootstrap;
> counter-parameterized modulo state; two input alphabets (dual sources).

---

## Session 3 — Transformation (stateless & lightly-stateful map family) (12) — DONE

`map`, `mapTo`, `pluck`, `filter`, `tap`, `scan` *(seedless)*, `reduce`,
`mergeScan`, `switchScan`, `partition`, `materialize`, `dematerialize`

> The simplest Mealy machines: mostly one operational state, output on every
> `next`. `reduce` is the "emit only on complete" cousin of `scan`.
> materialize/dematerialize reify Σ↔Λ notifications themselves. See
> [docs/09-transformation-family.md](09-transformation-family.md).

## Session 4 — Filtering & conditional emission (14) — DONE

`take`, `takeLast`, `takeWhile`, `takeUntil`, `skip`, `skipLast`, `skipWhile`,
`skipUntil`, `first`, `last`, `elementAt`, `single`, `ignoreElements`,
`defaultIfEmpty`

> Counter/predicate-gated states and terminal short-circuits (`take(n)` is the
> canonical counting FSM). `takeUntil`/`skipUntil` add a notifier input symbol.
> See [docs/10-filtering-family.md](10-filtering-family.md).

## Session 5 — Distinctness, existence & aggregation (14) — DONE

`distinct`, `distinctUntilKeyChanged`, `count`, `every`, `find`, `findIndex`,
`isEmpty`, `max`, `min`, `toArray`, `sequenceEqual`, `throwIfEmpty`,
`endWith`, `startWith`

> Set-membership state (`distinct` keeps a seen-set), running-aggregate state,
> and emit-on-complete reducers. `sequenceEqual` tracks two queues. See
> [docs/11-aggregation-family.md](11-aggregation-family.md).

## Session 6 — Higher-order flattening: map/all family (12) — DONE

`mergeMap`, `mergeMapTo`, `mergeAll`, `concatMap`, `concatMapTo`, `concatAll`,
`switchMap`, `switchMapTo`, `switchAll`, `exhaustMap`, `exhaust`, `exhaustAll`

> Inner-subscription bookkeeping as state: a set of active inners (merge),
> a queue (concat), a single replaceable inner (switch), a busy flag (exhaust).
> The four flattening strategies are four distinct δ policies. See
> [docs/12-flattening-family.md](12-flattening-family.md).

## Session 7 — Combination operators (14) — DONE

`combineLatest`, `combineLatestAll`, `combineLatestWith`, `combineAll`,
`withLatestFrom` *(revisit)*, `zip`, `zipAll`, `zipWith`, `concat`, `concatWith`,
`merge`, `mergeWith`, `race`, `raceWith`

> Multiple input alphabets. State = latest-value slots (combineLatest),
> per-source queues (zip), or a winner-lock (race). Generalizes session 2's
> `withLatestFrom`. See [docs/13-combination-family.md](13-combination-family.md).

## Session 8 — Time-based operators (16) — DONE

`delay`, `delayWhen`, `sampleTime`, `sample`, `auditTime`, `audit`,
`debounce`, `throttle`, `bufferTime`, `windowTime`, `timeInterval`, `timestamp`,
`timeout`, `timeoutWith`, `observeOn`, `subscribeOn`

> All reuse the `tick` input symbol from session 1. `debounce`/`throttle`/
> `audit`/`sample` are the durationSelector-driven generalizations of the
> *Time variants. `timeout` is a watchdog-timer FSM. See
> [docs/14-time-family.md](14-time-family.md).

## Session 9 — Buffering & windowing (9) — DONE

`buffer`, `bufferToggle`, `bufferWhen`, `window`, `windowCount`, `windowToggle`,
`windowWhen`, `groupBy`, `expand`
(`delayWhen` was covered in Session 8.)

> Accumulate-then-flush state driven by a boundary notifier. `window*` emit
> nested observables; `groupBy` maintains a map of key→subject; `expand` is
> recursive mergeMap. See
> [docs/15-buffering-windowing-family.md](15-buffering-windowing-family.md).

## Session 10 — Error handling, repetition & multicasting (17)

`catchError`, `retry`, `retryWhen`, `repeat`, `repeatWhen`,
`onErrorResumeNextWith`, `finalize`, `flatMap` (mergeMap alias), `share`,
`shareReplay`, `connect`,
`multicast`, `publish` / `publishBehavior` / `publishLast` / `publishReplay` /
`refCount`

> Resubscription loops as state (`retry`/`repeat` count attempts), a terminal
> cleanup edge (`finalize`), and reference-counted multicast state machines
> (share family). This session absorbs the deprecated-but-present publish\* set.

---

## Notes on sizing

Counts above sum to slightly more than 108 because a few operators are listed as
"revisit" (e.g. `withLatestFrom` in S7, `scan` seedless in S3) — these are
cross-references, not double-counts. The authoritative tracking is the
per-operator checklist below; each real operator file is ticked exactly once.

## Master checklist (116 operators)

Ticked as each is completed. (S1–S2 done.)

**Done (96):**
- *S1:* scan ✅, distinctUntilChanged ✅, debounceTime ✅, throttleTime ✅
- *S2:* throttleTime-trailing ✅, pairwise ✅, bufferCount ✅, withLatestFrom ✅
- *S3:* map ✅, mapTo ✅, pluck ✅, filter ✅, tap ✅, scan-seedless ✅,
  reduce ✅, mergeScan ✅, switchScan ✅, partition ✅, materialize ✅,
  dematerialize ✅
- *S4:* take ✅, takeLast ✅, takeWhile ✅, takeUntil ✅, skip ✅, skipLast ✅,
  skipWhile ✅, skipUntil ✅, first ✅, last ✅, elementAt ✅, single ✅,
  ignoreElements ✅, defaultIfEmpty ✅
- *S5:* distinct ✅, distinctUntilKeyChanged ✅, count ✅, every ✅, find ✅,
  findIndex ✅, isEmpty ✅, max ✅, min ✅, toArray ✅, sequenceEqual ✅,
  throwIfEmpty ✅, endWith ✅, startWith ✅
- *S6:* mergeMap ✅, mergeMapTo ✅, mergeAll ✅, concatMap ✅, concatMapTo ✅,
  concatAll ✅, switchMap ✅, switchMapTo ✅, switchAll ✅, exhaustMap ✅,
  exhaust ✅, exhaustAll ✅
- *S7:* combineLatest ✅, combineLatestWith ✅, combineLatestAll ✅, combineAll ✅,
  withLatestFrom ✅ (S2), zip ✅, zipWith ✅, zipAll ✅, concat ✅, concatWith ✅,
  merge ✅, mergeWith ✅, race ✅, raceWith ✅
- *S8:* delay ✅, delayWhen ✅, sampleTime ✅, sample ✅, auditTime ✅, audit ✅,
  debounce ✅, throttle ✅, bufferTime ✅, windowTime ✅, timeInterval ✅,
  timestamp ✅, timeout ✅, timeoutWith ✅, observeOn ✅, subscribeOn ✅
- *S9:* buffer ✅, bufferToggle ✅, bufferWhen ✅, window ✅, windowCount ✅,
  windowToggle ✅, windowWhen ✅, groupBy ✅, expand ✅

**Remaining (17):** see session 10 above — catchError, retry, retryWhen,
repeat, repeatWhen, onErrorResumeNextWith, finalize, flatMap, share,
shareReplay, connect, multicast, publish, publishBehavior, publishLast,
publishReplay, refCount.
