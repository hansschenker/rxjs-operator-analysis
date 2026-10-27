# `combineLatestWith` as a Mealy Machine

> `combineLatestWith(...others)` is the **pipeable** form of
> [`combineLatest`](combineLatest.md): `source.pipe(combineLatestWith(...o))` ≡
> `combineLatest(source, ...o)`. Identical latest-slots machine — the source is
> simply one of the N symmetric inputs.

Signature:

```ts
combineLatestWith<T, O extends readonly ObservableInput<unknown>[]>(...otherSources: [...O])
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical to [`combineLatest`](combineLatest.md):

- **Q** = `{ Priming(have, latest[]), Emitting(latest[]), Done }`.
- **Σ** = `next_i(v)`, `complete_i`, `error_i(e)` over all N sources (source +
  others).
- **Λ** = `{ emit(array), complete, error(e), noop }`.
- **q₀** = `Priming(∅, [empty…])`.

The source stream and the `others` are **symmetric** — any of them emitting
triggers output (once all slots are filled).

---

## 2. State Transition Table (STT)

| # | State          | Input        | Guard                      | Next / Output                       |
|---|----------------|--------------|----------------------------|-------------------------------------|
| 1 | `Priming(H,L)` | `next_i(v)`  | `H ∪ {i} ≠ all`            | `Priming(H∪{i}, L[i:=v])`; `noop`   |
| 2 | `Priming(H,L)` | `next_i(v)`  | `H ∪ {i} = all` (last one) | `Emitting(L[i:=v])`; `emit([...L])` |
| 3 | `Emitting(L)`  | `next_i(v)`  | —                          | `Emitting(L[i:=v])`; `emit([...L])` |
| 4 | any            | `complete_i` | others still live          | stay; `noop`                        |
| 5 | any            | all complete | —                          | `Done`; `complete`                  |
| 6 | any            | `error_i(e)` | —                          | `Done`; `error(e)`                  |

---

## 3. State Transition Diagram (STD)

Identical to [`combineLatest`](combineLatest.md)'s diagram.

---

## 4. From STT rows to test cases

- **Rows 2+3** — emits once both the source and the other have spoken, then
  re-emits on any change.

See [`tests/55b-combineLatestWith.test.ts`](../../tests/55b-combineLatestWith.test.ts).

---

## Relationship to the family

`combineLatestWith(...o)` = `combineLatest(source, ...o)`. See
[`combineLatest`](combineLatest.md) and
[`13-combination-family.md`](../13-combination-family.md).
