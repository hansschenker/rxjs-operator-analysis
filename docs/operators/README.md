# Per-operator analyses

This folder holds one **dedicated Mealy-machine analysis per operator**
(6-tuple → STT → STD → test mapping), matching the depth of the top-level
`docs/01-scan.md` … `docs/08-withLatestFrom.md` files.

Earlier sessions grouped operators 9–113 into eight **family** summary docs
(`docs/09-…` … `docs/16-…`). Those remain as conceptual overviews; this folder
breaks each operator out into its own file so every one of the 113 public
operators has an individual analysis linked to its individual test.

## Progress

| Family (session) | Operators | Individual docs |
|---|---|---|
| S1–S2 (foundations) | 8 | ✅ `docs/01-…08-` (already individual) |
| **S3 Transformation** | 12 | ✅ **done — see below** |
| **S4 Filtering** | 14 | ✅ **done — see below** |
| S5 Aggregation | 14 | ⏳ pending |
| S6 Flattening | 12 | ⏳ pending |
| S7 Combination | 14 | ⏳ pending |
| S8 Time | 16 | ⏳ pending |
| S9 Buffering/Windowing | 9 | ⏳ pending |
| S10 Error/Repeat/Multicast | 17 | ⏳ pending |

### S3 — Transformation family (12 operators)

| Operator | Doc | Test |
|---|---|---|
| `map` | [map.md](map.md) | [tests/09-map.test.ts](../../tests/09-map.test.ts) |
| `mapTo` | [mapTo.md](mapTo.md) | [tests/10-mapTo.test.ts](../../tests/10-mapTo.test.ts) |
| `pluck` | [pluck.md](pluck.md) | [tests/11-pluck.test.ts](../../tests/11-pluck.test.ts) |
| `filter` | [filter.md](filter.md) | [tests/12-filter.test.ts](../../tests/12-filter.test.ts) |
| `tap` | [tap.md](tap.md) | [tests/13-tap.test.ts](../../tests/13-tap.test.ts) |
| `scan` (seedless) | [scan-seedless.md](scan-seedless.md) | [tests/14-scan-seedless.test.ts](../../tests/14-scan-seedless.test.ts) |
| `reduce` | [reduce.md](reduce.md) | [tests/15-reduce.test.ts](../../tests/15-reduce.test.ts) |
| `mergeScan` | [mergeScan.md](mergeScan.md) | [tests/16-mergeScan.test.ts](../../tests/16-mergeScan.test.ts) |
| `switchScan` | [switchScan.md](switchScan.md) | [tests/17-switchScan.test.ts](../../tests/17-switchScan.test.ts) |
| `partition` | [partition.md](partition.md) | [tests/18-partition.test.ts](../../tests/18-partition.test.ts) |
| `materialize` | [materialize.md](materialize.md) | [tests/19-materialize.test.ts](../../tests/19-materialize.test.ts) |
| `dematerialize` | [dematerialize.md](dematerialize.md) | [tests/20-dematerialize.test.ts](../../tests/20-dematerialize.test.ts) |

> The family overview remains at
> [`docs/09-transformation-family.md`](../09-transformation-family.md).

### S4 — Filtering & conditional emission (14 operators)

| Operator | Doc | Test |
|---|---|---|
| `take` | [take.md](take.md) | [tests/21-take.test.ts](../../tests/21-take.test.ts) |
| `takeLast` | [takeLast.md](takeLast.md) | [tests/22-takeLast.test.ts](../../tests/22-takeLast.test.ts) |
| `takeWhile` | [takeWhile.md](takeWhile.md) | [tests/23-takeWhile.test.ts](../../tests/23-takeWhile.test.ts) |
| `takeUntil` | [takeUntil.md](takeUntil.md) | [tests/24-takeUntil.test.ts](../../tests/24-takeUntil.test.ts) |
| `skip` | [skip.md](skip.md) | [tests/25-skip.test.ts](../../tests/25-skip.test.ts) |
| `skipLast` | [skipLast.md](skipLast.md) | [tests/26-skipLast.test.ts](../../tests/26-skipLast.test.ts) |
| `skipWhile` | [skipWhile.md](skipWhile.md) | [tests/27-skipWhile.test.ts](../../tests/27-skipWhile.test.ts) |
| `skipUntil` | [skipUntil.md](skipUntil.md) | [tests/28-skipUntil.test.ts](../../tests/28-skipUntil.test.ts) |
| `first` | [first.md](first.md) | [tests/29-first.test.ts](../../tests/29-first.test.ts) |
| `last` | [last.md](last.md) | [tests/30-last.test.ts](../../tests/30-last.test.ts) |
| `elementAt` | [elementAt.md](elementAt.md) | [tests/31-elementAt.test.ts](../../tests/31-elementAt.test.ts) |
| `single` | [single.md](single.md) | [tests/32-single.test.ts](../../tests/32-single.test.ts) |
| `ignoreElements` | [ignoreElements.md](ignoreElements.md) | [tests/33-ignoreElements.test.ts](../../tests/33-ignoreElements.test.ts) |
| `defaultIfEmpty` | [defaultIfEmpty.md](defaultIfEmpty.md) | [tests/34-defaultIfEmpty.test.ts](../../tests/34-defaultIfEmpty.test.ts) |

> The family overview remains at
> [`docs/10-filtering-family.md`](../10-filtering-family.md).
