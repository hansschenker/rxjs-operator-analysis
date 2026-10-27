# `switchMapTo` as a Mealy Machine

> `switchMapTo(inner)` maps every source value to the **same fixed inner**,
> keeping only the latest run: each new source value cancels the in-flight inner
> and restarts it. It is `switchMap(() => inner)` — the switch policy with a
> constant projection. Deprecated in favour of `switchMap(() => inner)`.

Signature:

```ts
switchMapTo<T, R>(innerObservable: ObservableInput<R>)
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical skeleton to [`switchMap`](switchMap.md) with `project = () => inner`.

### Q — States

- `Running(cur?, outerDone)`, `Done`.

### δ, λ

Each `outerNext(v)` unsubscribes the current run and subscribes a fresh run of
the same `inner`. `q₀ = Running(∅, false)`.

---

## 2. State Transition Table (STT)

| # | State             | Input           | Next / Output                               |
|---|-------------------|-----------------|---------------------------------------------|
| U1| `Running(c,_)`    | `innerNext(x)`  | `emit(x)`                                   |
| S1| `Running(cur?,_)` | `outerNext(v)`  | unsubscribe `cur`; subscribe `inner`; `noop`|
| S2| `Running(cur,_)`  | `innerComplete` | `cur := ∅`; `noop`                          |
| U4| `Running(∅,true)` | (inner done)    | outer done → `complete`                     |
| U2/U3| `Running(c,_)` | inner/outer error| `error(e)` → `Done`                        |

---

## 3. State Transition Diagram (STD)

Identical to [`switchMap`](switchMap.md)'s diagram, with every `outerNext` edge
restarting the fixed inner.

---

## 4. From STT rows to test cases

- **S1** — a second source value restarts/cancels the current run of the inner;
  only the latest run's values reach the output.

See [`tests/54c-switchMapTo.test.ts`](../../tests/54c-switchMapTo.test.ts).

---

## Relationship to the family

`switchMapTo(inner)` = [`switchMap`](switchMap.md)`(() => inner)`. See
[`12-flattening-family.md`](../12-flattening-family.md).
