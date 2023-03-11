// import {  } from '~/util'

import type { HTMLTag, HTMLTagPos, Attrs } from '~/types'

export const VOID_TAGS = [
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

const _HTMLDECLARATION = /<!([^>]*)>/
const _HTMLCOMMENT = /<!--([\s\S]*?)-->/

const _HTMLTAG = /<(\/?)\s*([^\s\/>]+)([^>]*)(?<!\/)(\/?)>/
const _HTMLTAGOPEN = /<\s*([^\s\/>]+)([^>]*)(?<!\/)(\/?)>/
const _HTMLTAGCLOSE = /<\/\s*([^\s\/>]+)[^>]*>/
const _PARSEATTRIBUTES = /([\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w-]+)))?/
const _HTMLTAGTEXT = />([^<]*)[^]*(?<=>([^<]*)<)/

export const HTMLDECLARATION = (flags: string = 'g') => new RegExp(_HTMLDECLARATION.source, flags)
export const HTMLCOMMENT = (flags: string = 'g') => new RegExp(_HTMLCOMMENT.source, flags)

export const HTMLTAG = (tag: string | string[] = '[^\\s\\/>]+', flags: string = 'g'): RegExp => {
  const regex = _HTMLTAG.source
  if (tag) regex.replace(`[^\\s\\/>]+`, typeof tag === 'string' ? tag : tag.join('|'))
  return new RegExp(regex, flags)
}

export const HTMLTAGOPEN = (flags: string = 'g') => new RegExp(_HTMLTAGOPEN.source, flags)
export const HTMLTAGCLOSE = (flags: string = 'g') => new RegExp(_HTMLTAGCLOSE.source, flags)
export const PARSEATTRIBUTES = (flags: string = 'g') => new RegExp(_PARSEATTRIBUTES.source, flags)
export const HTMLTAGTEXT = (flags: string = 'g') => new RegExp(_HTMLTAGTEXT.source, flags)

export function tagWithName(tag: string | string[], flags: string = 'g'): RegExp {
  return new RegExp(`<${typeof tag === 'string' ? tag : `(${tag.join('|')})`}([^>]*?)\/?>`, flags)
}

function eachMatch<T>(str: string, exp: RegExp, callback: (match: RegExpExecArray) => T): T | void {
  let result
  const traverse = () => {
    let match = exp.exec(str)
    if (match !== null) {
      result = callback(match)
      if (result) return result
      traverse()
    }
    return null
  }
  traverse()
}

function getAttrs(rawAttrs?: string) {
  let obj: Attrs = {}
  if (rawAttrs) {
    eachMatch(rawAttrs, PARSEATTRIBUTES(), (match) => {
      const key = match?.[1]
      if (key) obj[key] = match[2] ?? match[3] ?? match[4] ?? true
    })
  }
  return obj
}

function getCloseTagPos(html: string, index: number, name?: string): HTMLTagPos | null {
  let tag: HTMLTagPos | null = null
  let count = 0
  eachMatch(html.slice(index), HTMLTAG(name), match => {
    // Match: [1]: '/' if close tag, [2]: tag name, [3]: `/` if self closing tag
    if (count <= 1) {
      // If tag is a closing tag and there is only 1 open tag in count, return its end index
      if (match[1]) {
        tag = [index + match.index + match[0].length, match[0]]
        return true
      }
      // Check for self closing tags and tags that do not need `/>`
      if (match[4] || VOID_TAGS.includes(match[2]!)) {
        tag = [index + match[0].length, match[0]]
        return true
      }
    }
    // If closing tag, decrease open tag count
    if (count > 0 && match[1]) count--
    // If open tag increase open tag count
    if (!match[1] && !(match[4] || VOID_TAGS.includes(match[2]!))) count++
  })
  return tag
}

function getElement(html: string, index?: number, name?: string): string | null {
  let el
  if (index) {
    el = getCloseTagPos(html, index, name)
    if (el) return html.slice(index, el[0])
  }
  return null
}

function getText(html: string, index?: number) {
  let el = getElement(html, index)
  let match
  if (el) match = HTMLTAGTEXT().exec(el)
  if (match) return (match[1] ?? '') + (match[2] ?? '')
  return null
}

function remove(html: string, index?: number) {
  let el
  if (index) el = getElement(html, index)
  if (index && el) return html.replace(new RegExp(`\\s*${el}`), '')
  return null
}


export class HTMLRx {
  HTML: string
  selected?: HTMLTag

  constructor(html: string) {
    this.HTML = html
  }

  toString() {
    return this.HTML
  }

  clean() {
    this.HTML = this.HTML.replace(/\s*<!--([\s\S]*?)-->/g, '')
    return this
  }

  walk<T>(
    callback: (tag: {
      raw: string
      name: string
      rawAttrs: string
      selfClosing: boolean
      index: number
      attrs: () => Attrs
      element: () => string | null
    }) => T
  ): T | void {
    return eachMatch(this.HTML, HTMLTAGOPEN(), (m) =>
      callback({
        raw: m[0],
        name: m[1]!,
        rawAttrs: m[2]||'',
        selfClosing: !!m[3],
        index: m.index,
        attrs: () => getAttrs(m[2]),
        element: () => getElement(this.HTML, m.index),
      })
    )
  }

  select(name?: string | null, attrs?: Attrs | null, n?: number) {
    let found: boolean
    this.walk(({ index, name: _name, rawAttrs, selfClosing, attrs: _attrs}) => {
      if (name === _name) found = true
      if (attrs) {
        let entries = Object.entries(_attrs())
        for (const [key, val] of entries) {
          if (attrs[key]) {
            if (attrs[key] === val || true) found = true
          }
        }
      }
      if (found) {
        this.selected = {index, name: _name, rawAttrs:rawAttrs||'', selfClosing}
        return true
      }
    })
    return this
  }

  attrs() {
    return getAttrs(this.selected?.rawAttrs)
  }

  remove() {
    this.HTML = remove(this.HTML, this.selected?.index) || this.HTML
    return this
  }

  element(): string | null {
    return getElement(this.HTML, this.selected?.index, this.selected?.name)
  }

  text() {
    return getText(this.HTML, this.selected?.index)
  }
}
