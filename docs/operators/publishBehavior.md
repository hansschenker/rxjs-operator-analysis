# `publishBehavior` as a Mealy Machine

> `publishBehavior(initialValue)` = `multicast(() => new BehaviorSubject(x))`: a
> multicast backed by a **`BehaviorSubject`**, so a **late subscriber
> immediately receives the latest value** (or the seed `x` before any source
> value). Deprecated in favour of [`connect`](connect.md)/[`share`](share.md).

Signature:

```ts
publishBehavior<T>(initialValue: T)   // = multicast(() => new BehaviorSubject(initialValue))
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

The shared multicast skeleton with the Subject fixed to a `BehaviorSubject(x)`:

### Q — States

- `Hot(refCount, behaviorSubject)` holding the **latest value** (seeded with
  `x`); plus `Cold`/`Done`.

### δ, λ

Each source `next(v)` updates the BehaviorSubject's current value and fans out. A
**new** subscriber immediately gets the current value on subscribe.

### q₀ — Initial state

`q₀ = Cold` (the BehaviorSubject is seeded with `initialValue` when connected).

---

## 2. State Transition Table (STT)

| # | State    | Input             | Next / Output                                   |
|---|----------|-------------------|-------------------------------------------------|
| 1 | `Hot(n)` | `subscribe`       | `Hot(n+1)`; **emit current value** to newcomer  |
| 2 | `Hot(n)` | source `next(v)`  | update current; `emit(v)` to all                |
| 3 | `Hot(n)` | `complete`/`error`| forward to all                                 |

Row 1 is the BehaviorSubject behaviour: the newcomer gets the latest value
immediately.

---

## 3. State Transition Diagram (STD)

See [`multicast`](multicast.md) — same skeleton, Subject = `BehaviorSubject(x)`.

---

## 4. From STT rows to test cases

- **Row 1** — a late subscriber immediately receives the latest value (`b`),
  then live values.

See [`tests/78e-publishBehavior.test.ts`](../../tests/78e-publishBehavior.test.ts).

---

## Relationship to the family

`publishBehavior(x)` = `multicast(() => new BehaviorSubject(x))`. See
[`publish`](publish.md) and
[`16-error-repeat-multicast-family.md`](../16-error-repeat-multicast-family.md).
