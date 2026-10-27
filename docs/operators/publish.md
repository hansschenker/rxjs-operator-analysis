# `publish` as a Mealy Machine

> `publish()` = `multicast(() => new Subject())`: a multicast backed by a **plain
> `Subject`**, so **late subscribers see only values emitted after they join**.
> It returns a `ConnectableObservable` (run the source via `.connect()` or
> [`refCount`](refCount.md)). Deprecated in favour of
> [`connect`](connect.md)/[`share`](share.md).

Signature:

```ts
publish<T>(selector?)   // = multicast(() => new Subject())
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

The shared multicast skeleton ([`multicast`](multicast.md)) with the Subject
fixed to a plain `Subject` (no replay):

### Q — States

- `Idle` / `Connected(subject)` / `Done` (or `Cold`/`Hot` under `refCount`).

### δ, λ

Each source value fans out through the plain Subject to all **current**
subscribers. A subscriber that joins later misses everything emitted before it
attached.

### q₀ — Initial state

`q₀ = Idle` (or `Cold` with `refCount`).

---

## 2. State Transition Table (STT)

| # | State          | Input             | Next / Output                               |
|---|----------------|-------------------|---------------------------------------------|
| 1 | `Hot(n)`       | `subscribe`       | `Hot(n+1)`; **no replay** (plain Subject)   |
| 2 | `Hot(n)`       | source `next(v)`  | `emit(v)` to current subscribers only       |
| 3 | `Hot(n)`       | `complete`/`error`| forward to all                             |

(Connect/ref-count rows per [`multicast`](multicast.md)/[`refCount`](refCount.md).)

---

## 3. State Transition Diagram (STD)

See [`multicast`](multicast.md) — same skeleton, Subject = plain `Subject`.

---

## 4. From STT rows to test cases

- **Row 1-2** — a late subscriber (joining after `b`) sees only the subsequent
  value `c` and completion.

See [`tests/78b-publish.test.ts`](../../tests/78b-publish.test.ts).

---

## Relationship to the family

`publish()` = `multicast(() => new Subject())`;
[`publishBehavior`](publishBehavior.md)/[`publishReplay`](publishReplay.md)/[`publishLast`](publishLast.md)
swap in richer Subjects. See
[`16-error-repeat-multicast-family.md`](../16-error-repeat-multicast-family.md).
