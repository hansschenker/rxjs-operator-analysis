# `exhaust` as a Mealy Machine

> `exhaust()` is the **deprecated alias** of [`exhaustAll`](exhaustAll.md). It
> flattens a higher-order Observable with the exhaust policy: ignore new inners
> while one is active. Behaviour is identical to `exhaustAll`; prefer
> `exhaustAll` in new code.

Signature:

```ts
exhaust<T>()   // deprecated — use exhaustAll()
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical in every respect to [`exhaustAll`](exhaustAll.md): the exhaust-policy
skeleton with identity projection.

- **Q** = `{ Running(busy, cur?, outerDone), Done }`.
- **Σ** = outer + inner notifications.
- **Λ** = `{ emit(x), complete, error(e), noop }`.
- **q₀** = `Running(false, ∅, false)`.

---

## 2. State Transition Table (STT)

| # | State                   | Input               | Guard        | Next / Output                       |
|---|-------------------------|---------------------|--------------|-------------------------------------|
| E1| `Running(false,∅,_)`    | `outerNext(inner)`  | `busy=false` | subscribe `inner`; `busy=true`; `noop`|
| E2| `Running(true,c,_)`     | `outerNext(inner)`  | `busy=true`  | **drop `inner`**; `noop`            |
| E3| `Running(true,c,_)`     | `innerComplete`     | —            | `busy=false`; `noop`                |
| U1| `Running(b,c,_)`        | `innerNext(x)`      | —            | `emit(x)`                           |
| U4| `Running(false,∅,true)` | (inner done)        | outer done   | `complete`                          |
| U2/U3| `Running(b,c,_)`     | inner/outer error   | —            | `error(e)` → `Done`                 |

---

## 3. State Transition Diagram (STD)

See [`exhaustAll`](exhaustAll.md) — the diagram is identical.

---

## 4. From STT rows to test cases

- **E2** — behaves exactly like `exhaustAll`: a new inner is dropped while the
  current one is active.

See [`tests/53e-exhaust.test.ts`](../../tests/53e-exhaust.test.ts).

---

## Relationship to the family

`exhaust()` ≡ [`exhaustAll`](exhaustAll.md) (deprecated name). See
[`12-flattening-family.md`](../12-flattening-family.md).
