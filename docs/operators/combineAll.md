# `combineAll` as a Mealy Machine

> `combineAll()` is the **deprecated alias** of
> [`combineLatestAll`](combineLatestAll.md). It flattens a higher-order source by
> buffering the inner Observables until the outer completes, then combines them
> with latest-slots semantics. Behaviour is identical; prefer `combineLatestAll`
> in new code.

Signature:

```ts
combineAll<R>()   // deprecated — use combineLatestAll()
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical in every respect to [`combineLatestAll`](combineLatestAll.md): the
two-phase collect-then-combineLatest machine.

- **Q** = `{ Collecting(inners[]), Combining(…), Done }`.
- **Σ** = outer notifications, then inner notifications in Phase 2.
- **Λ** = `{ emit(array), complete, error(e), noop }`.
- **q₀** = `Collecting([])`.

---

## 2. State Transition Table (STT)

| # | State           | Input              | Next / Output                              |
|---|-----------------|--------------------|--------------------------------------------|
| 1 | `Collecting(I)` | `outerNext(inner)` | `Collecting(I ++ [inner])`; `noop`         |
| 2 | `Collecting(I)` | `outerComplete`    | `Combining(combineLatest(I))`; `noop`      |
| 3 | `Combining(…)`  | inner notifications| as per [`combineLatest`](combineLatest.md) |
| 4 | any             | `error(e)`         | `Done`; `error(e)`                         |

---

## 3. State Transition Diagram (STD)

See [`combineLatestAll`](combineLatestAll.md) — the diagram is identical.

---

## 4. From STT rows to test cases

- Behaves exactly like `combineLatestAll`: combines the collected inners after
  the outer completes.

See [`tests/59b-combineAll.test.ts`](../../tests/59b-combineAll.test.ts).

---

## Relationship to the family

`combineAll()` ≡ [`combineLatestAll`](combineLatestAll.md) (deprecated name).
See [`13-combination-family.md`](../13-combination-family.md).
