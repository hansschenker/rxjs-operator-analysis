# `publishReplay` as a Mealy Machine

> `publishReplay(bufferSize)` = `multicast(() => new ReplaySubject(n))`: a
> multicast backed by a **`ReplaySubject`**, so a **late subscriber replays the
> last `n` values**. It is the `ConnectableObservable` ancestor of
> [`shareReplay`](shareReplay.md). Deprecated in favour of
> [`connect`](connect.md)/[`share`](share.md).

Signature:

```ts
publishReplay<T>(bufferSize?, windowTime?, selectorOrScheduler?, scheduler?)
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

The shared multicast skeleton with the Subject fixed to a `ReplaySubject(n)`:

### Q — States

- `Hot(refCount, replaySubject)` holding a buffer of up to `n` values; plus
  `Cold`/`Done`.

### δ, λ

Each source `next(v)` is buffered (cap `n`) and fanned out. A **new** subscriber
replays the buffered last `n` values, then receives live values.

### q₀ — Initial state

`q₀ = Cold`.

---

## 2. State Transition Table (STT)

| # | State    | Input             | Next / Output                                   |
|---|----------|-------------------|-------------------------------------------------|
| 1 | `Hot(m)` | `subscribe`       | `Hot(m+1)`; **replay last n** to newcomer       |
| 2 | `Hot(m)` | source `next(v)`  | buffer (cap n); `emit(v)` to all                |
| 3 | `Hot(m)` | `complete`/`error`| forward to all                                 |

---

## 3. State Transition Diagram (STD)

See [`multicast`](multicast.md) — same skeleton, Subject = `ReplaySubject(n)`.

---

## 4. From STT rows to test cases

- **Row 1** — a late subscriber replays the last `n` values synchronously, then
  receives live values and completion.

See [`tests/78f-publishReplay.test.ts`](../../tests/78f-publishReplay.test.ts).

---

## Relationship to the family

`publishReplay(n)` = `multicast(() => new ReplaySubject(n))`; with `refCount` it
is the classic equivalent of [`shareReplay`](shareReplay.md). See
[`16-error-repeat-multicast-family.md`](../16-error-repeat-multicast-family.md).
