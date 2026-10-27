# `mergeMapTo` as a Mealy Machine

> `mergeMapTo(inner)` maps **every** source value to the **same fixed inner**
> Observable and merges them. It is `mergeMap(() => inner)` — the merge policy
> with a constant projection. Deprecated in favour of `mergeMap(() => inner)`,
> but still shipped.

Signature:

```ts
mergeMapTo<T, R>(innerObservable: ObservableInput<R>, concurrent = Infinity)
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical skeleton to [`mergeMap`](mergeMap.md), with `project = () => inner`
(the projection ignores the source value and always yields the same inner).

### Q — States

- `Running(actives, buffer, outerDone)`, `Done`.

### δ, λ

Each `outerNext(v)` subscribes a fresh subscription to the **same** `inner`
(up to `concurrent`); inner values forward and interleave. `q₀ = Running(∅, ∅,
false)`.

---

## 2. State Transition Table (STT)

| # | State               | Input             | Guard               | Next / Output                               |
|---|---------------------|-------------------|---------------------|---------------------------------------------|
| U1| `Running(A,B,_)`    | `innerNext_i(x)`  | —                   | `emit(x)`                                   |
| M1| `Running(A,B,_)`    | `outerNext(v)`    | `\|A\| < concurrent`| subscribe `inner`; `A∪{i}`; `noop`          |
| M2| `Running(A,B,_)`    | `outerNext(v)`    | `\|A\| = concurrent`| enqueue; `noop`                             |
| M3| `Running(A,B,_)`    | `innerComplete_i` | —                   | `A\{i}` (+ drain buffer); `noop`            |
| U4| `Running(∅,∅,true)` | (last inner done) | outer done          | `complete`                                  |
| U2/U3| `Running(…)`     | inner/outer error | —                   | `error(e)` → `Done`                         |

---

## 3. State Transition Diagram (STD)

Identical to [`mergeMap`](mergeMap.md)'s diagram, with every `outerNext` edge
subscribing the fixed inner.

---

## 4. From STT rows to test cases

- **M1 + U1** — each outer value starts the same inner; outputs interleave by
  time.

See [`tests/54a-mergeMapTo.test.ts`](../../tests/54a-mergeMapTo.test.ts).

---

## Relationship to the family

`mergeMapTo(inner)` = [`mergeMap`](mergeMap.md)`(() => inner)`. See
[`12-flattening-family.md`](../12-flattening-family.md).
