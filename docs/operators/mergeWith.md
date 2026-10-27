# `mergeWith` as a Mealy Machine

> `mergeWith(...others)` is the **pipeable** form of [`merge`](merge.md):
> `source.pipe(mergeWith(...o))` ≡ `merge(source, ...o)`. Identical interleave
> machine — the source is one of the concurrently-subscribed inputs.

Signature:

```ts
mergeWith<T, O extends readonly ObservableInput<unknown>[]>(...otherSources: [...O])
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical to [`merge`](merge.md):

- **Q** = `{ Running(doneCount), Done }`, `q₀ = Running(0)`.
- **Σ** = `next_i(v)`, `complete_i`, `error_i(e)` over source + others.
- **Λ** = `{ emit(v), complete, error(e), noop }`.

---

## 2. State Transition Table (STT)

| # | State        | Input        | Guard     | Next / Output                   |
|---|--------------|--------------|-----------|---------------------------------|
| 1 | `Running(d)` | `next_i(v)`  | —         | `emit(v)` (interleaved by time) |
| 2 | `Running(d)` | `complete_i` | `d+1 < N` | `Running(d+1)`; `noop`          |
| 3 | `Running(d)` | `complete_i` | `d+1 = N` | `Done`; `complete`              |
| 4 | any          | `error_i(e)` | —         | `Done`; `error(e)`              |

---

## 3. State Transition Diagram (STD)

Identical to [`merge`](merge.md)'s diagram.

---

## 4. From STT rows to test cases

- **Row 1** — values from the source and the other interleave by arrival time.

See [`tests/57d-mergeWith.test.ts`](../../tests/57d-mergeWith.test.ts).

---

## Relationship to the family

`mergeWith(...o)` = `merge(source, ...o)`. See [`merge`](merge.md) and
[`13-combination-family.md`](../13-combination-family.md).
