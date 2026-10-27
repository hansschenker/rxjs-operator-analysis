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
| **S5 Aggregation** | 14 | ✅ **done — see below** |
| **S6 Flattening** | 12 | ✅ **done — see below** |
| **S7 Combination** | 14 | ✅ **done — see below** |
| **S8 Time** | 16 | ✅ **done — see below** |
| **S9 Buffering/Windowing** | 9 | ✅ **done — see below** |
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

### S5 — Distinctness, existence & aggregation (14 operators)

| Operator | Doc | Test |
|---|---|---|
| `distinct` | [distinct.md](distinct.md) | [tests/35-distinct.test.ts](../../tests/35-distinct.test.ts) |
| `distinctUntilKeyChanged` | [distinctUntilKeyChanged.md](distinctUntilKeyChanged.md) | [tests/36-distinctUntilKeyChanged.test.ts](../../tests/36-distinctUntilKeyChanged.test.ts) |
| `every` | [every.md](every.md) | [tests/37-every.test.ts](../../tests/37-every.test.ts) |
| `find` | [find.md](find.md) | [tests/38-find.test.ts](../../tests/38-find.test.ts) |
| `findIndex` | [findIndex.md](findIndex.md) | [tests/39-findIndex.test.ts](../../tests/39-findIndex.test.ts) |
| `isEmpty` | [isEmpty.md](isEmpty.md) | [tests/40-isEmpty.test.ts](../../tests/40-isEmpty.test.ts) |
| `count` | [count.md](count.md) | [tests/41-count.test.ts](../../tests/41-count.test.ts) |
| `max` | [max.md](max.md) | [tests/42-max.test.ts](../../tests/42-max.test.ts) |
| `min` | [min.md](min.md) | [tests/43-min.test.ts](../../tests/43-min.test.ts) |
| `toArray` | [toArray.md](toArray.md) | [tests/44-toArray.test.ts](../../tests/44-toArray.test.ts) |
| `sequenceEqual` | [sequenceEqual.md](sequenceEqual.md) | [tests/45-sequenceEqual.test.ts](../../tests/45-sequenceEqual.test.ts) |
| `throwIfEmpty` | [throwIfEmpty.md](throwIfEmpty.md) | [tests/46-throwIfEmpty.test.ts](../../tests/46-throwIfEmpty.test.ts) |
| `startWith` | [startWith.md](startWith.md) | [tests/47-startWith.test.ts](../../tests/47-startWith.test.ts) |
| `endWith` | [endWith.md](endWith.md) | [tests/48-endWith.test.ts](../../tests/48-endWith.test.ts) |

> The family overview remains at
> [`docs/11-aggregation-family.md`](../11-aggregation-family.md).

### S6 — Higher-order flattening (12 operators)

One Mealy skeleton, four δ policies (run / queue / cancel / drop). Note: the
`*All` and `*MapTo` alias tests were split out of the former bundled
`tests/53-all-aliases` / `tests/54-mapTo-aliases` files into one file per
operator.

| Operator | Policy | Doc | Test |
|---|---|---|---|
| `mergeMap` | merge (run) | [mergeMap.md](mergeMap.md) | [tests/49-mergeMap.test.ts](../../tests/49-mergeMap.test.ts) |
| `concatMap` | concat (queue) | [concatMap.md](concatMap.md) | [tests/50-concatMap.test.ts](../../tests/50-concatMap.test.ts) |
| `switchMap` | switch (cancel) | [switchMap.md](switchMap.md) | [tests/51-switchMap.test.ts](../../tests/51-switchMap.test.ts) |
| `exhaustMap` | exhaust (drop) | [exhaustMap.md](exhaustMap.md) | [tests/52-exhaustMap.test.ts](../../tests/52-exhaustMap.test.ts) |
| `mergeAll` | merge (identity) | [mergeAll.md](mergeAll.md) | [tests/53a-mergeAll.test.ts](../../tests/53a-mergeAll.test.ts) |
| `concatAll` | concat (identity) | [concatAll.md](concatAll.md) | [tests/53b-concatAll.test.ts](../../tests/53b-concatAll.test.ts) |
| `switchAll` | switch (identity) | [switchAll.md](switchAll.md) | [tests/53c-switchAll.test.ts](../../tests/53c-switchAll.test.ts) |
| `exhaustAll` | exhaust (identity) | [exhaustAll.md](exhaustAll.md) | [tests/53d-exhaustAll.test.ts](../../tests/53d-exhaustAll.test.ts) |
| `exhaust` | exhaust (alias) | [exhaust.md](exhaust.md) | [tests/53e-exhaust.test.ts](../../tests/53e-exhaust.test.ts) |
| `mergeMapTo` | merge (fixed inner) | [mergeMapTo.md](mergeMapTo.md) | [tests/54a-mergeMapTo.test.ts](../../tests/54a-mergeMapTo.test.ts) |
| `concatMapTo` | concat (fixed inner) | [concatMapTo.md](concatMapTo.md) | [tests/54b-concatMapTo.test.ts](../../tests/54b-concatMapTo.test.ts) |
| `switchMapTo` | switch (fixed inner) | [switchMapTo.md](switchMapTo.md) | [tests/54c-switchMapTo.test.ts](../../tests/54c-switchMapTo.test.ts) |

> The family overview remains at
> [`docs/12-flattening-family.md`](../12-flattening-family.md).

### S7 — Combination operators (14 operators)

N input streams merged by one of five strategies. The `*With` forms are the
pipeable equivalents of the static constructors; the `*All` forms are two-phase
higher-order flatteners. `withLatestFrom` is a revisit — its dedicated doc is
[`docs/08-withLatestFrom.md`](../08-withLatestFrom.md) (asymmetric
latest-slots). The former bundled tests (`55`–`59`) were split into one file per
operator.

| Operator | Strategy | Doc | Test |
|---|---|---|---|
| `combineLatest` | latest-slots | [combineLatest.md](combineLatest.md) | [tests/55a-combineLatest.test.ts](../../tests/55a-combineLatest.test.ts) |
| `combineLatestWith` | latest-slots (pipeable) | [combineLatestWith.md](combineLatestWith.md) | [tests/55b-combineLatestWith.test.ts](../../tests/55b-combineLatestWith.test.ts) |
| `combineLatestAll` | latest-slots (higher-order) | [combineLatestAll.md](combineLatestAll.md) | [tests/59a-combineLatestAll.test.ts](../../tests/59a-combineLatestAll.test.ts) |
| `combineAll` | latest-slots (alias) | [combineAll.md](combineAll.md) | [tests/59b-combineAll.test.ts](../../tests/59b-combineAll.test.ts) |
| `zip` | per-source queue | [zip.md](zip.md) | [tests/56a-zip.test.ts](../../tests/56a-zip.test.ts) |
| `zipWith` | per-source queue (pipeable) | [zipWith.md](zipWith.md) | [tests/56b-zipWith.test.ts](../../tests/56b-zipWith.test.ts) |
| `zipAll` | per-source queue (higher-order) | [zipAll.md](zipAll.md) | [tests/59c-zipAll.test.ts](../../tests/59c-zipAll.test.ts) |
| `concat` | sequential | [concat.md](concat.md) | [tests/57a-concat.test.ts](../../tests/57a-concat.test.ts) |
| `concatWith` | sequential (pipeable) | [concatWith.md](concatWith.md) | [tests/57b-concatWith.test.ts](../../tests/57b-concatWith.test.ts) |
| `merge` | interleave | [merge.md](merge.md) | [tests/57c-merge.test.ts](../../tests/57c-merge.test.ts) |
| `mergeWith` | interleave (pipeable) | [mergeWith.md](mergeWith.md) | [tests/57d-mergeWith.test.ts](../../tests/57d-mergeWith.test.ts) |
| `race` | winner-lock | [race.md](race.md) | [tests/58a-race.test.ts](../../tests/58a-race.test.ts) |
| `raceWith` | winner-lock (pipeable) | [raceWith.md](raceWith.md) | [tests/58b-raceWith.test.ts](../../tests/58b-raceWith.test.ts) |
| `withLatestFrom` | asymmetric latest-slots (revisit) | [docs/08-withLatestFrom.md](../08-withLatestFrom.md) | [tests/08-withLatestFrom.test.ts](../../tests/08-withLatestFrom.test.ts) |

> The family overview remains at
> [`docs/13-combination-family.md`](../13-combination-family.md).

### S8 — Time-based operators (16 operators)

All reuse the synthetic `tick` input symbol. The `*Time` operators are
duration-selector machines with `timer(d)` wired in. The former bundled tests
(`60`–`67`, two operators each) were split into one file per operator.

| Operator | Sub-family | Doc | Test |
|---|---|---|---|
| `delay` | fixed delay | [delay.md](delay.md) | [tests/60a-delay.test.ts](../../tests/60a-delay.test.ts) |
| `delayWhen` | fixed delay | [delayWhen.md](delayWhen.md) | [tests/60b-delayWhen.test.ts](../../tests/60b-delayWhen.test.ts) |
| `sampleTime` | sample | [sampleTime.md](sampleTime.md) | [tests/61a-sampleTime.test.ts](../../tests/61a-sampleTime.test.ts) |
| `sample` | sample | [sample.md](sample.md) | [tests/61b-sample.test.ts](../../tests/61b-sample.test.ts) |
| `auditTime` | silence window (trailing) | [auditTime.md](auditTime.md) | [tests/62a-auditTime.test.ts](../../tests/62a-auditTime.test.ts) |
| `audit` | silence window (trailing) | [audit.md](audit.md) | [tests/62b-audit.test.ts](../../tests/62b-audit.test.ts) |
| `throttle` | silence window (leading) | [throttle.md](throttle.md) | [tests/63a-throttle.test.ts](../../tests/63a-throttle.test.ts) |
| `debounce` | quiet period | [debounce.md](debounce.md) | [tests/63b-debounce.test.ts](../../tests/63b-debounce.test.ts) |
| `bufferTime` | time buffering | [bufferTime.md](bufferTime.md) | [tests/64a-bufferTime.test.ts](../../tests/64a-bufferTime.test.ts) |
| `windowTime` | time windowing | [windowTime.md](windowTime.md) | [tests/64b-windowTime.test.ts](../../tests/64b-windowTime.test.ts) |
| `timestamp` | metadata tagging | [timestamp.md](timestamp.md) | [tests/65a-timestamp.test.ts](../../tests/65a-timestamp.test.ts) |
| `timeInterval` | metadata tagging | [timeInterval.md](timeInterval.md) | [tests/65b-timeInterval.test.ts](../../tests/65b-timeInterval.test.ts) |
| `timeout` | watchdog | [timeout.md](timeout.md) | [tests/66a-timeout.test.ts](../../tests/66a-timeout.test.ts) |
| `timeoutWith` | watchdog (deprecated) | [timeoutWith.md](timeoutWith.md) | [tests/66b-timeoutWith.test.ts](../../tests/66b-timeoutWith.test.ts) |
| `observeOn` | scheduling | [observeOn.md](observeOn.md) | [tests/67a-observeOn.test.ts](../../tests/67a-observeOn.test.ts) |
| `subscribeOn` | scheduling | [subscribeOn.md](subscribeOn.md) | [tests/67b-subscribeOn.test.ts](../../tests/67b-subscribeOn.test.ts) |

> The family overview remains at
> [`docs/14-time-family.md`](../14-time-family.md).

### S9 — Buffering & windowing (9 operators)

The buffer→array / window→Observable duality, driven by a boundary signal, plus
keyed partition (`groupBy`) and recursive flatten (`expand`). The former bundled
tests (`68`–`70`, two operators each) were split into one file per operator.

| Operator | Boundary | Doc | Test |
|---|---|---|---|
| `buffer` | external notifier → array | [buffer.md](buffer.md) | [tests/68a-buffer.test.ts](../../tests/68a-buffer.test.ts) |
| `bufferWhen` | per-cycle selector → array | [bufferWhen.md](bufferWhen.md) | [tests/68b-bufferWhen.test.ts](../../tests/68b-bufferWhen.test.ts) |
| `window` | external boundary → Observable | [window.md](window.md) | [tests/69a-window.test.ts](../../tests/69a-window.test.ts) |
| `windowWhen` | per-cycle selector → Observable | [windowWhen.md](windowWhen.md) | [tests/69b-windowWhen.test.ts](../../tests/69b-windowWhen.test.ts) |
| `bufferToggle` | openings + closings → arrays | [bufferToggle.md](bufferToggle.md) | [tests/70a-bufferToggle.test.ts](../../tests/70a-bufferToggle.test.ts) |
| `windowToggle` | openings + closings → Observables | [windowToggle.md](windowToggle.md) | [tests/70b-windowToggle.test.ts](../../tests/70b-windowToggle.test.ts) |
| `windowCount` | count boundary → Observables | [windowCount.md](windowCount.md) | [tests/71-windowCount.test.ts](../../tests/71-windowCount.test.ts) |
| `groupBy` | keyed partition | [groupBy.md](groupBy.md) | [tests/72-groupBy.test.ts](../../tests/72-groupBy.test.ts) |
| `expand` | recursive flatten | [expand.md](expand.md) | [tests/73-expand.test.ts](../../tests/73-expand.test.ts) |

> The family overview remains at
> [`docs/15-buffering-windowing-family.md`](../15-buffering-windowing-family.md).
