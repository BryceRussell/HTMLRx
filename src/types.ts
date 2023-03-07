type Whitespace = ' ' | '\n' | '\t'
type Quote = '"' | "'"

// ` word\t\n another word` => ['word', 'another', 'word']
type SplitWhitespace<S extends string, Word extends string = ''> = S extends `${infer First}${infer Rest}`
  ? First extends Whitespace
    ? Word extends ''
      ? SplitWhitespace<Rest, ''>
      : [Word, ...SplitWhitespace<Rest, ''>]
    : SplitWhitespace<Rest, `${Word}${First}`>
  : Word extends ''
  ? []
  : [Word]

/* https://github.com/type-challenges/type-challenges/issues/21419 */

// e.g. {} => { K: V }, { K: V1 } => { K: [V1, V] }, { K1: V1 } => { K1: V1, K: V }
type SetProperty<T, K extends PropertyKey, V extends any = true> = {
  [P in keyof T | K]: P extends K
    ? P extends keyof T // duplicate key exists
      ? T[P] extends V
        ? T[P] // duplicate k-v pair: no change
        : T[P] extends any[] // existing value is a tuple
        ? // append new value only if it doesn't already exist in the tuple
          V extends T[P][number]
          ? T[P]
          : [...T[P], V]
        : [T[P], V] // reassign value to tuple initialized with existing and new value
      : V // no duplicate key -> assign new k-v pair
    : P extends keyof T
    ? T[P]
    : never
}
// e.g. ['k1=v1', 'k2=v2', 'k2=v3', 'k1']
// => { k1: 'v1' } => { k1: 'v1', k2: ['v2', 'v3'] } => { k1: ['v1', true], k2: ['v2', 'v3'] }
type MergeParams<T extends string[], M = {}> = T extends [infer E, ...infer Rest extends string[]]
  ? E extends `${infer K}=${Quote}${infer V}${Quote}`
    ? MergeParams<Rest, SetProperty<M, K, V>>
    : E extends `${infer K}=${infer V}`
      ? MergeParams<Rest, SetProperty<M, K, V>>
    : E extends `${infer K}`
    ? MergeParams<Rest, SetProperty<M, K, true>>
    : never
  : { [K in keyof M]: M[K] }

/* --- */

type ParseRawHTMLAttributes<T extends string> = MergeParams<SplitWhitespace<T>>

type CloseTag<Str extends string> = Str extends `</${infer Tag}>`
  ? Tag
  : never

  type StringArray<T extends any[]> = {
    [K in keyof T]: string;
  }

type OpenTag<Str extends string | [string, Record<string, string|true>]> =
  Str extends `<${infer Inside}`
    ? Inside extends `${infer Data}>`
      ? Inside extends `${infer _}/>`
        ? never
        : SplitWhitespace<Data> extends [infer Name, ...infer Attrs extends string[]]
          ? [Name, MergeParams<Attrs>]
          : Data
      : SplitWhitespace<Inside> extends [infer Name, ...infer Attrs extends string[]]
        ? [Name, MergeParams<Attrs>]
        : Inside
    : never

const ooo: OpenTag<`<div>`> = ['div', {}]

type HTMLTag<Str extends string> = OpenTag<Str> | CloseTag <Str>

// Example usage
const tagString = `<div class="test" open>`
const tag: OpenTag<typeof tagString> = ['div', { class: 'test', open: true }]

const attrString = `
  required
  id="_id"
  class='test test2' 
  test="Tes"\taria-label=9
  test=2
`

type TestSplit = SplitWhitespace<typeof attrString>

type TestAttrs = ParseRawHTMLAttributes<typeof attrString>
