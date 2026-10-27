# `concatWith` as a Mealy Machine

> `concatWith(...others)` is the **pipeable** form of [`concat`](concat.md):
> `source.pipe(concatWith(...o))` ≡ `concat(source, ...o)`. Identical sequential
> machine — the source runs first, then each other source in order.

Signature:

```ts
concatWith<T, O extends readonly ObservableInput<unknown>[]>(...otherSources: [...O])
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical to [`concat`](concat.md):

- **Q** = `{ Active(k), Done }`, `q₀ = Active(0)` (the source is `k = 0`).
- **Σ** = `next_k(v)`, `complete_k`, `error_k(e)` for the active source.
- **Λ** = `{ emit(v), complete, error(e), noop }`.

---

## 2. State Transition Table (STT)

| # | State       | Input        | Next / Output                                                      |
|---|-------------|--------------|--------------------------------------------------------------------|
| 1 | `Active(k)` | `next_k(v)`  | `emit(v)`                                                          |
| 2 | `Active(k)` | `complete_k` | if `k+1 < N`: `Active(k+1)`; else `Done`, `complete`               |
| 3 | `Active(k)` | `error_k(e)` | `Done`; `error(e)`                                                 |

---

## 3. State Transition Diagram (STD)

Identical to [`concat`](concat.md)'s diagram.

---

## 4. From STT rows to test cases

- **Rows 1/2** — the source is forwarded fully, then the other source in order
  (no overlap).

See [`tests/57b-concatWith.test.ts`](../../tests/57b-concatWith.test.ts).

---

## Relationship to the family

`concatWith(...o)` = `concat(source, ...o)`. See [`concat`](concat.md) and
[`13-combination-family.md`](../13-combination-family.md).
