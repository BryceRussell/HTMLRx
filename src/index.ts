// import {  } from '~/util'

import type { HTMLTagPos, HTMLPos, Attrs, HTMLAttrs, ParseHTMLAttributes } from '~/types'

const VOID_TAGS = [
  'meta',
  'link',
  'img',
  'input',
  'hr',
  'br',
  'source',
  'param',
  'area',
  'base',
  'col',
  'command',
  'embed',
  'keygen',
  'track',
  'wbr',
]

export const _HTMLDECLARATION = /<!([^>]*)>/
export const _HTMLCOMMENT = /<!--([\s\S]*?)-->/
export const _HTMLTAG = /<(\/?)\s*([^\s\/>]+)([^>]*)(?<!\/)(\/?)>/
export const _HTMLTAGUNWRAP = /<\/?([^>]*)(?<!\/)\/?>/
export const _HTMLTAGOPENSTART = /<\s*([^\s\/>]+)/
export const _HTMLTAGOPEN = /<\s*([^\s\/<>]+)\s*(?:\s*[^\/\s>]+)*\s*(\/?)>/
export const _HTMLTAGCLOSE = /<\/\s*([^\s\/>]+)\s*[^>]*>/
export const _PARSEATTRIBUTES = /([^\s'"=]+)=?(?:"([^"]*)"|'([^']*)'|([^'"\s]*))/

export const HTMLDECLARATION = (flags: string = 'g') => new RegExp(_HTMLDECLARATION.source, flags)
export const HTMLCOMMENT = (flags: string = 'g') => new RegExp(_HTMLCOMMENT.source, flags)
export const HTMLTAG = (flags: string = 'g') => new RegExp(_HTMLTAG.source, flags)
export const HTMLTAGOPENSTART = (flags: string = 'g') => new RegExp(_HTMLTAGOPENSTART.source, flags)
export const HTMLTAGOPEN = (flags: string = 'g') => new RegExp(_HTMLTAGOPEN.source, flags)
export const HTMLTAGCLOSE = (flags: string = 'g') => new RegExp(_HTMLTAGCLOSE.source, flags)
export const PARSEATTRIBUTES = (flags: string = 'g') => new RegExp(_PARSEATTRIBUTES.source, flags)
// /type=?("[^"]*"|'[^']*'|[^'"\s]*)/

export const isHTMLTag = (str: string) => HTMLTAG().test(str)
export const isHTMLTagOpen = (str: string) => HTMLTAGOPEN().test(str)
export const isHTMLTagClose = (str: string) => HTMLTAGCLOSE().test(str)

export function tagWithName(tag: string | string[], flags: string = 'g'): RegExp {
  return new RegExp(`<${typeof tag === 'string' ? tag : `(${tag.join('|')})`}([^>]*?)\/?>`, flags)
}

export function allTags(tag: string | string[] = '[^\\s\\/>]+', flags: string = 'g'): RegExp {
  return new RegExp(_HTMLTAG.source.replace(`[^\s>]+`, typeof tag === 'string' ? tag : tag.join('|')), flags)
}

export function getTagClose(html: string, startPos: number, tagName?: string): HTMLTagPos | null {
  const REGEX = allTags(tagName) //  Matches all tags, optionally pass a tag name to prevent extra loops
  const fragment = html.slice(startPos) //  Trim everything before the tag to prevent extra loops
  let count = 0
  let match
  //  loop over all tags in html fragment
  while ((match = REGEX.exec(fragment)) !== null) {
    // Match: [1]: '/' if close tag, [2]: tag name, [3]: `/` if self closing tag
    if (count <= 1) {
      // If tag is a closing tag and there is only 1 open tag in count, return its end index
      if (match[1]) return [startPos + match.index + match[0].length, match[0]]
      // Check for self closing tags and tags that do not need `/>`
      if (match[4] || VOID_TAGS.includes(match[2]!)) return [startPos + match[0].length, match[0]]
    }
    // If closing tag, decrease open tag count
    if (count > 0 && match[1]) count--
    // If open tag increase open tag count
    if (!match[1] && !(match[4] || VOID_TAGS.includes(match[2]!))) count++
  }
  return null
}

export class HTMLRx {
  HTML: string
  selected?: HTMLTagPos

  constructor(html: string) {
    this.HTML = html
  }

  each<T>(exp: RegExp, callback: (match: RegExpExecArray) => T): T | T | void {
    let result
    let match
    while ((match = exp.exec(this.HTML)) !== null) {
      let _result = callback(match)
      if (_result) {
        result = _result
        break
      }
    }
    return result
  }

  walk<T>(
    callback: (
      tag: {
        raw: string
        name: string
        rawAttrs: string | null
        close: boolean
        selfClosing: boolean
        index: number
      },
      element: () => string | null
    ) => T
  ): T | void {
    return this.each(HTMLTAG(), (m) =>
      callback(
        { raw: m[0], name: m[2]!, rawAttrs: m[3] || null, close: !!m[1], selfClosing: !!m[4], index: m.index },
        () => this.element(m.index)
      )
    )
  }

  select(name?: string | null, attrs?: string | null, value?: string | null, n?: number) {
    let count = 0
    this.walk(({index, raw, name: _name}) => {
      count++
      if (name === _name) this.selected = [index, raw]
      if (n && count >= n) this.selected = [index, raw]
    })
  }

  element(index?: number) {

    const tag = getTagClose(this.HTML, index || this.selected[0])
    return tag ? this.HTML.slice(index, tag[0]) : null
  }
}

// export function getTagsOpen(html: string): HTMLPos {
//   const tagMap: HTMLPos = {}
//   const tags = html.matchAll(HTMLTAGOPEN())
//   for (const match of tags) {
//     const tag = match[0]
//     const index = match.index!
//     tagMap[tag] = [...(tagMap[tag] ?? []), index]
//   }
//   return tagMap
// }

// export function parseTag(tags: string[]): HTMLAttrs {
//   const tagMap: HTMLAttrs = {}
//   for (const tag of tags) {
//     const match = _HTMLTAGUNWRAP.exec(tag)
//     if (match) {
//       const regex = PARSEATTRIBUTES()
//       const inside = match[1]?.matchAll(regex) ?? []
//       const [name, ...attrs] = inside
//       for (const attr of attrs) {
//         tagMap[tag] = { ...tagMap[tag], [attr[1]!]: attr[2] ?? attr[4] ?? attr[3] ?? '' } ?? {}
//       }
//     }
//   }
//   return tagMap
// }
