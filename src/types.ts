import type { DefinedIntrinsicElements, IntrinsicElements } from '~/html';

export type HTMLTagPos<T extends string = string> = [number, T]

export type AttributeObject = Record<string, string|true>

export type HTMLTagData<T extends string> = {
  raw: string
  index: number
  name: T
  rawAttrs: string
  selfClosing: boolean
}

export type HTMLTagSelected<T extends string = string> = HTMLTagData<T> & {
  attrs?: GetAttributes<T>
  closeTag?: HTMLTagPos<T> | null
  element?: string
}

// ---------

/** Any supported HTML or SVG element name, as defined by the HTML specification */
export type HTMLTagName = string & keyof IntrinsicElements;

/** The built-in attributes for any known HTML or SVG element name */
export type HTMLTagAttributes<Tag extends HTMLTagName> = IntrinsicElements[Tag]

export type AllHTMLAttributes = {
  [Tag in HTMLTagName]: HTMLTagAttributes<Tag>
}[HTMLTagName];


export type GetAttributes<T> =
  T extends HTMLTagName
    ? HTMLTagAttributes<T> & AttributeObject
    : AttributeObject

export interface WalkCallback<T extends string = string> {
  (tag: {
    index: number;
    raw: string;
    name: T;
    rawAttrs: string;
    attrs: () => GetAttributes<T>;
    selfClosing: boolean;
    select: () => true;
  }): boolean | null | undefined | void;
}

export type ReturnText<P extends 'before' | 'after' | 'both' | 'tuple' | undefined> =
  P extends 'tuple'
    ? [string | undefined, string | undefined] | null
    : string | null | undefined

export interface HTMLRxInterface {

}

// type Whitespace = ' ' | '\n' | '\t'
// type Quote = '"' | "'"

// // ` word\t\n another word` => ['word', 'another', 'word']
// type SplitAttributes<S extends string, Word extends string = ''> = S extends `${infer First}${infer Rest}`
//   ? First extends Whitespace
//     ? Word extends ''
//       ? SplitAttributes<Rest, ''>
//       : [Word, ...SplitAttributes<Rest, ''>]
//     : SplitAttributes<Rest, `${Word}${First}`>
//   : Word extends ''
//   ? []
//   : [Word]

// /* https://github.com/type-challenges/type-challenges/issues/21419 */

// // e.g. {} => { K: V }, { K: V1 } => { K: [V1, V] }, { K1: V1 } => { K1: V1, K: V }
// type SetProperty<T, K extends PropertyKey, V extends any = true> = {
//   [P in keyof T | K]: P extends K
//     ? P extends keyof T // duplicate key exists
//       ? T[P] extends V
//         ? T[P] // duplicate k-v pair: no change
//         : T[P] extends any[] // existing value is a tuple
//         ? // append new value only if it doesn't already exist in the tuple
//           V extends T[P][number]
//           ? T[P]
//           : [...T[P], V]
//         : [T[P], V] // reassign value to tuple initialized with existing and new value
//       : V // no duplicate key -> assign new k-v pair
//     : P extends keyof T
//     ? T[P]
//     : never
// }
// // e.g. ['k1=v1', 'k2=v2', 'k2=v3', 'k1']
// // => { k1: 'v1' } => { k1: 'v1', k2: ['v2', 'v3'] } => { k1: ['v1', true], k2: ['v2', 'v3'] }
// type MergeParams<T extends string[], M = {}> = T extends [infer E, ...infer Rest extends string[]]
//   ? E extends `${infer K}=${Quote}${infer V}${Quote}`
//     ? MergeParams<Rest, SetProperty<M, K, V>>
//     : E extends `${infer K}=${infer V}`
//       ? MergeParams<Rest, SetProperty<M, K, V>>
//     : E extends `${infer K}`
//     ? MergeParams<Rest, SetProperty<M, K, true>>
//     : never
//   : { [K in keyof M]: M[K] }

// /* --- */

// export type ParseHTMLAttributes<T extends string | null | undefined> = T extends string 
//   ? MergeParams<SplitAttributes<T>>
//   : {}
