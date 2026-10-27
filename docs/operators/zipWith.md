# `zipWith` as a Mealy Machine

> `zipWith(...others)` is the **pipeable** form of [`zip`](zip.md):
> `source.pipe(zipWith(...o))` ≡ `zip(source, ...o)`. Identical
> per-source-queue machine — the source is one of the N queued inputs.

Signature:

```ts
zipWith<T, O extends readonly ObservableInput<unknown>[]>(...otherSources: [...O])
```

---

## 1. The 6-Tuple  M = (Q, Σ, Λ, δ, λ, q₀)

Identical to [`zip`](zip.md):

- **Q** = `{ Zipping(Q[0..N-1]), Done }`.
- **Σ** = `next_i(v)`, `complete_i`, `error_i(e)` over source + others.
- **Λ** = `{ emit(tuple), complete, error(e), noop }`.
- **q₀** = `Zipping([[], …])`.

---

## 2. State Transition Table (STT)

| # | State        | Input        | Guard                           | Next / Output                        |
|---|--------------|--------------|---------------------------------|--------------------------------------|
| 1 | `Zipping(Q)` | `next_i(v)`  | some other queue empty          | enqueue; `noop`                      |
| 2 | `Zipping(Q)` | `next_i(v)`  | all queues non-empty after push | dequeue one from each; `emit([...])` |
| 3 | `Zipping(Q)` | `complete_i` | `Q[i]` empty                    | `Done`; `complete`                   |
| 4 | `Zipping(Q)` | `complete_i` | `Q[i]` non-empty                | stay                                 |
| 5 | any          | `error_i(e)` | —                               | `Done`; `error(e)`                   |

---

## 3. State Transition Diagram (STD)

Identical to [`zip`](zip.md)'s diagram.

---

## 4. From STT rows to test cases

- **Row 2** — pairs source and other by index; the faster buffers ahead.

See [`tests/56b-zipWith.test.ts`](../../tests/56b-zipWith.test.ts).

---

## Relationship to the family

`zipWith(...o)` = `zip(source, ...o)`. See [`zip`](zip.md) and
[`13-combination-family.md`](../13-combination-family.md).
