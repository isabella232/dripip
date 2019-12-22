import * as Semver from 'semver'

export type ParsedTag =
  | { type: 'unknown'; value: string }
  | { type: 'stable_release'; value: Semver.SemVer }
  | { type: 'pre_release'; value: Semver.SemVer }

export function parseTag(rawTag: string): ParsedTag {
  const semverParseResult = Semver.parse(rawTag)
  if (semverParseResult !== null) {
    if (semverParseResult.prerelease.length > 0) {
      return { type: 'pre_release', value: semverParseResult } as const
    } else {
      return { type: 'stable_release', value: semverParseResult } as const
    }
  } else {
    return { type: 'unknown', value: rawTag } as const
  }
}

export const indentBlock4 = (block: string): string => indentBlock(4, block)

export const indentBlock = (size: number, block: string): string => {
  return block
    .split('\n')
    .map(
      line =>
        range(size)
          .map(constant(' '))
          .join('') + line
    )
    .join('\n')
}

const constant = <T>(x: T): (() => T) => {
  return function() {
    return x
  }
}

const range = (times: number): number[] => {
  const list: number[] = []
  while (list.length < times) {
    list.push(list.length + 1)
  }
  return list
}

type IndexableKeyTypes = string | number | symbol

type Indexable<T = unknown> = Record<string | number, T>

type JustIndexableTypes<T> = T extends IndexableKeyTypes ? T : never

type KeysMatching<Rec, Keys> = NonNullable<
  {
    [RecKey in keyof Rec]: Rec[RecKey] extends Keys ? RecKey : never
  }[keyof Rec]
>

export type GroupBy<T extends Indexable, K extends IndexableKeys<T>> = {
  [KV in JustIndexableTypes<T[K]>]?: Array<T extends Record<K, KV> ? T : never>
}

type IndexableKeys<Rec> = KeysMatching<Rec, IndexableKeyTypes>

export function groupByProp<
  Obj extends Indexable,
  KeyName extends IndexableKeys<Obj>
>(xs: Obj[], keyName: KeyName): GroupBy<Obj, KeyName> {
  type KeyValue = JustIndexableTypes<Obj[KeyName]>
  const seed = {} as GroupBy<Obj, KeyName>

  return xs.reduce((groupings, x) => {
    const groupName = x[keyName] as KeyValue

    if (groupings[groupName] === undefined) {
      groupings[groupName] = []
    }

    // We know the group will exist, given above initializer.
    groupings[groupName]!.push(
      x as Obj extends Record<KeyName, KeyValue> ? Obj : never
    )

    return groupings
  }, seed)
}