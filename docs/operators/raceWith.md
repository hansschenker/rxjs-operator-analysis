# `raceWith` as a Mealy Machine

> `raceWith(...others)` is the **pipeable** form of [`race`](race.md):
> `source.pipe(raceWith(...o))` ≡ `race(source, ...o)`. Identical winner-lock
> machine — the source is one of the racing candidates.

Signature:

```ts
raceWith<T, O extends readonly ObservableInput<unknown>[]>(...otherSources: [...O])
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical to [`race`](race.md):

- **Q** = `{ Racing(candidates), Locked(winner), Done }`, `q₀ = Racing(all)`.
- **Σ** = `next_i(v)`, `complete_i`, `error_i(e)` over source + others.
- **Λ** = `{ emit(v), complete, error(e), noop }`.

---

## 2. State Transition Table (STT)

| # | State       | Input        | Next / Output                                 |
|---|-------------|--------------|-----------------------------------------------|
| 1 | `Racing(C)` | `next_i(v)`  | unsubscribe all `≠ i`; `Locked(i)`; `emit(v)` |
| 2 | `Racing(C)` | `error_i(e)` | `Done`; `error(e)`                            |
| 3 | `Locked(w)` | `next_w(v)`  | `Locked(w)`; `emit(v)`                        |
| 4 | `Locked(w)` | `complete_w` | `Done`; `complete`                            |
| 5 | `Locked(w)` | `error_w(e)` | `Done`; `error(e)`                            |

---

## 3. State Transition Diagram (STD)

Identical to [`race`](race.md)'s diagram.

---

## 4. From STT rows to test cases

- **Row 1+3** — when the source emits first it wins and the other is dropped.

See [`tests/58b-raceWith.test.ts`](../../tests/58b-raceWith.test.ts).

---

## Relationship to the family

`raceWith(...o)` = `race(source, ...o)`. See [`race`](race.md) and
[`13-combination-family.md`](../13-combination-family.md).
