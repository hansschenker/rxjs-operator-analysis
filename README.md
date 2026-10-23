# RxJS Operators as Mealy Machines

> **Main contributor: [Kiro](https://kiro.dev).** This project — the 6-tuple
> analyses, the State Transition Diagrams and Tables, and the derived marble
> test suites — was authored by Kiro, the AI software engineer, in
> collaboration with the repository owner.

Modeling RxJS operator behavior as **Mealy machines** using the **6-tuple
analysis method**, then mechanically deriving:

1. a **State Transition Diagram (STD)** — the visual state machine, and
2. a **State Transition Table (STT)** — one row per transition, where
3. **each STT row becomes a test case** — verified with the RxJS
   `TestScheduler` and marble syntax.

## Why a Mealy machine (and not Moore)?

In a **Mealy** machine the output is a function of **(current state × input)** —
the output is produced **on the transition (edge)**. In a **Moore** machine the
output is a function of the state alone (output on the node).

RxJS operators are naturally Mealy: a single input notification
(`next`/`complete`/`error`) both changes internal state **and** produces an
output notification **in the same step**. e.g. `scan` receives `next(v)` and, on
that same edge, emits the new accumulation.

## The 6-tuple  M = (Q, Σ, Λ, δ, λ, q₀)

| Symbol | Meaning                 | RxJS mapping                                            |
|--------|-------------------------|---------------------------------------------------------|
| **Q**  | States                  | Internal operator memory (accumulator, last value, timer status) |
| **Σ**  | Input alphabet          | Source notifications: `next(v)`, `complete`, `error` — plus `tick` for time-based operators |
| **Λ**  | Output alphabet         | Downstream notifications: `emit(v)`, `complete`, `error`, or `noop` |
| **δ**  | Transition fn `Q×Σ → Q` | How internal state changes                              |
| **λ**  | Output fn `Q×Σ → Λ`     | What is emitted on that transition (the Mealy part)     |
| **q₀** | Initial state           | State at subscription time                              |

## The pipeline

```
6-tuple analysis  ──►  STD (Mermaid)  ──►  STT (table)  ──►  marble test per row
   (docs/*.md)          (docs/*.md)         (docs/*.md)        (tests/*.test.ts)
```

Edge-label convention throughout is standard Mealy notation: **`input / output`**.

## Operators analyzed

| # | Operator                | State essence                               | Doc | Tests |
|---|-------------------------|---------------------------------------------|-----|-------|
| 1 | `scan`                  | running accumulator `(acc, i)`              | [docs/01-scan.md](docs/01-scan.md) | [tests/01-scan.test.ts](tests/01-scan.test.ts) |
| 2 | `distinctUntilChanged`  | last emitted value `p` + bootstrap          | [docs/02-distinctUntilChanged.md](docs/02-distinctUntilChanged.md) | [tests/02-distinctUntilChanged.test.ts](tests/02-distinctUntilChanged.test.ts) |
| 3 | `debounceTime`          | pending value + armed silence timer         | [docs/03-debounceTime.md](docs/03-debounceTime.md) | [tests/03-debounceTime.test.ts](tests/03-debounceTime.test.ts) |
| 4 | `throttleTime`          | gate open / throttle window                 | [docs/04-throttleTime.md](docs/04-throttleTime.md) | [tests/04-throttleTime.test.ts](tests/04-throttleTime.test.ts) |
| 5 | `throttleTime` *(trailing: true)* | window carries a pending value; emit-on-tick edge | [docs/05-throttleTime-trailing.md](docs/05-throttleTime-trailing.md) | [tests/05-throttleTime-trailing.test.ts](tests/05-throttleTime-trailing.test.ts) |
| 6 | `pairwise`              | two-state bootstrap; output is a tuple      | [docs/06-pairwise.md](docs/06-pairwise.md) | [tests/06-pairwise.test.ts](tests/06-pairwise.test.ts) |
| 7 | `bufferCount`           | counter-parameterized modulo buffer         | [docs/07-bufferCount.md](docs/07-bufferCount.md) | [tests/07-bufferCount.test.ts](tests/07-bufferCount.test.ts) |
| 8 | `withLatestFrom`        | two input alphabets; latch latest-other     | [docs/08-withLatestFrom.md](docs/08-withLatestFrom.md) | [tests/08-withLatestFrom.test.ts](tests/08-withLatestFrom.test.ts) |
| 9 | **Transformation family** (12): `map`, `mapTo`, `pluck`, `filter`, `tap`, `scan` seedless, `reduce`, `mergeScan`, `switchScan`, `partition`, `materialize`, `dematerialize` | single-state projectors, accumulators, higher-order scans, and notification reification | [docs/09-transformation-family.md](docs/09-transformation-family.md) | [tests/09–20](tests/) |
| 10 | **Filtering family** (14): `take`, `takeLast`, `takeWhile`, `takeUntil`, `skip`, `skipLast`, `skipWhile`, `skipUntil`, `first`, `last`, `elementAt`, `single`, `ignoreElements`, `defaultIfEmpty` | counting FSMs, predicate latches, notifier-driven cutoffs, and existence machines (4-outcome `single`) | [docs/10-filtering-family.md](docs/10-filtering-family.md) | [tests/21–34](tests/) |
| 11 | **Aggregation family** (14): `distinct`, `distinctUntilKeyChanged`, `every`, `find`, `findIndex`, `isEmpty`, `count`, `max`, `min`, `toArray`, `sequenceEqual`, `throwIfEmpty`, `startWith`, `endWith` | seen-set distinctness, short-circuit existence quantifiers, emit-on-complete folds (dual-queue `sequenceEqual`), and prepend/append bracketing | [docs/11-aggregation-family.md](docs/11-aggregation-family.md) | [tests/35–48](tests/) |
| 12 | **Flattening family** (12): `mergeMap`/`mergeMapTo`/`mergeAll`, `concatMap`/`concatMapTo`/`concatAll`, `switchMap`/`switchMapTo`/`switchAll`, `exhaustMap`/`exhaust`/`exhaustAll` | one Mealy skeleton (inner-subscription bookkeeping) parameterised by four δ policies: run / queue / cancel / drop | [docs/12-flattening-family.md](docs/12-flattening-family.md) | [tests/49–54](tests/) |
| 13 | **Combination family** (14): `combineLatest`/`combineLatestWith`/`combineLatestAll`/`combineAll`, `zip`/`zipWith`/`zipAll`, `concat`/`concatWith`, `merge`/`mergeWith`, `race`/`raceWith`, `withLatestFrom` (revisit) | N input alphabets: latest-value slots, per-source queues, sequential/interleave, and a winner-lock | [docs/13-combination-family.md](docs/13-combination-family.md) | [tests/55–59](tests/) |

See [docs/00-roadmap.md](docs/00-roadmap.md) for the full 10-session plan
covering all 116 public RxJS 7.x operators.

The four span a deliberate difficulty gradient:

- **`scan`** — minimal state, output on every input (purest Mealy self-loop).
- **`distinctUntilChanged`** — a genuine *bootstrap* state (`S0`) plus a
  *guarded* transition (the comparator), so two rows share an input symbol and
  differ only by guard. FSM coverage then demands one guard-true and one
  guard-false test.
- **`debounceTime`** / **`throttleTime`** — **time becomes an input symbol**
  (`tick`). They are duals: debounce emits *on the timer firing*, throttle emits
  *on the leading value* and the timer firing is silent (default config).

## Running the tests

```bash
npm install
npm test            # single run
npm run test:watch  # watch mode
```

All rows across all analyzed operators: **216 passing marble tests** (74
operators; sessions 1–7 of the 10-session roadmap).

## Methodology lesson: let the machine validate the model

The `debounceTime` STT claims two different emit paths:

- **Row 3** — the silence timer fires `d` ms after the last value (a `tick`).
- **Row 5** — the source *completes* while a value is pending, which flushes it
  **immediately at the completion frame** (a short-circuit).

Writing the tests surfaced a trap: if the marble source completes *before* `d`
ms of silence elapses (e.g. `-a|`), Row 5 fires and the natural Row-3 tick
**never happens** — and the flush lands on the *completion* frame, not `d` ms
after the value. The first draft of the tests encoded the wrong frames; the
`TestScheduler` rejected them with exact frame numbers, which is precisely how
an executable Mealy model keeps the hand-written STT honest. To actually
exercise Row 3 you must leave a real silent gap `>= d` after the last value.

This is the core payoff of the method: **a command exiting 0 is not proof of
correctness — the assertion on exact emission frames is.**
