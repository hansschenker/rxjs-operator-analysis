# `concatMapTo` as a Mealy Machine

> `concatMapTo(inner)` maps every source value to the **same fixed inner** and
> runs them **one at a time, in order**. It is `concatMap(() => inner)` — the
> concat (queue) policy with a constant projection. Deprecated in favour of
> `concatMap(() => inner)`.

Signature:

```ts
concatMapTo<T, R>(innerObservable: ObservableInput<R>)
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical skeleton to [`concatMap`](concatMap.md) with `project = () => inner`.

### Q — States

- `Running(cur?, buffer, outerDone)`, `Done`.

### δ, λ

Each `outerNext(v)` starts a subscription to the same `inner` if idle, else
queues the request; on completion the next queued run starts. `q₀ = Running(∅,
∅, false)`.

---

## 2. State Transition Table (STT)

| # | State                | Input           | Guard          | Next / Output                          |
|---|----------------------|-----------------|----------------|----------------------------------------|
| U1| `Running(c,B,_)`     | `innerNext(x)`  | —              | `emit(x)`                              |
| M1| `Running(∅,B,_)`     | `outerNext(v)`  | idle           | subscribe `inner` as `cur`; `noop`     |
| M2| `Running(c,B,_)`     | `outerNext(v)`  | busy           | enqueue; `noop`                        |
| M3| `Running(c,B,_)`     | `innerComplete` | queue non-empty| start next queued; `noop`              |
| M4| `Running(c,B,_)`     | `innerComplete` | queue empty    | `cur := ∅`; `noop`                     |
| U4| `Running(∅,∅,true)`  | (inner done)    | outer done     | `complete`                             |
| U2/U3| `Running(…)`      | inner/outer error| —             | `error(e)` → `Done`                    |

---

## 3. State Transition Diagram (STD)

Identical to [`concatMap`](concatMap.md)'s diagram, with every `outerNext` edge
starting the fixed inner.

---

## 4. From STT rows to test cases

- **M1-M3** — the same inner runs in order: the second outer value's run starts
  only after the first completes.

See [`tests/54b-concatMapTo.test.ts`](../../tests/54b-concatMapTo.test.ts).

---

## Relationship to the family

`concatMapTo(inner)` = [`concatMap`](concatMap.md)`(() => inner)`. See
[`12-flattening-family.md`](../12-flattening-family.md).
