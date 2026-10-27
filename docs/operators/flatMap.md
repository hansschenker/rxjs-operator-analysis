# `flatMap` as a Mealy Machine

> `flatMap` is a **deprecated rename** of [`mergeMap`](mergeMap.md) — literally
> `export const flatMap = mergeMap`. Same function reference, same
> merge-policy flattening machine. Prefer `mergeMap` in new code.

Signature:

```ts
flatMap<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent = Infinity)
// === mergeMap
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical in every respect to [`mergeMap`](mergeMap.md): the merge-policy
flattening skeleton (subscribe every inner up to `concurrent`, interleave
emissions, complete when the source and all inners finish).

- **Q** = `{ Running(actives, buffer, outerDone), Done }`.
- **Σ** = outer + dynamic inner notifications.
- **Λ** = `{ emit(x), complete, error(e), noop }`.
- **q₀** = `Running(∅, ∅, false)`.

---

## 2. State Transition Table (STT)

See [`mergeMap`](mergeMap.md) — the STT is identical (U1/M1-M4/U2-U4).

---

## 3. State Transition Diagram (STD)

Identical to [`mergeMap`](mergeMap.md)'s diagram.

---

## 4. From STT rows to test cases

- `flatMap` is asserted to be the **same function reference** as `mergeMap`, and
  to flatten inners concurrently with identical output.

See [`tests/76-flatMap.test.ts`](../../tests/76-flatMap.test.ts).

---

## Relationship to the family

`flatMap` ≡ [`mergeMap`](mergeMap.md) (Session 6), included here as the
deprecated alias. See
[`16-error-repeat-multicast-family.md`](../16-error-repeat-multicast-family.md).
