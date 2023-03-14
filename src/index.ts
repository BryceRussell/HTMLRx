// import {  } from '~/util'

import type { Attrs, HTMLTagPos, HTMLTag, HTMLTagSelected } from '~/types'

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
      if (!result) traverse()
    }
    return null
  }
  traverse()
}

function parseAttrs(rawAttrs: string | null | undefined) {
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
  eachMatch(html.slice(index), HTMLTAG(name), (match) => {
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


export class HTMLRx {
  HTML: string
  selected: HTMLTagSelected | null | undefined 

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
      index: number
      raw: string
      name: string
      rawAttrs: string
      attrs: () => Attrs
      selfClosing: boolean
      select: () => true
    }) => T
  ): T | undefined | void {
    return eachMatch(this.HTML, HTMLTAGOPEN(), (m) => {
      const tag = {
        index: m.index,
        raw: m[0],
        name: m[1]!,
        rawAttrs: m[2]||'',
        selfClosing: !!m[3]
      }
      return callback.call(this, {
        ...tag,
        attrs: () => parseAttrs(tag.rawAttrs),
        select: () => {
          this.selected = tag
          return true
        },
      })
    })
  }

  select(name?: string | null | undefined, attrs?: Attrs | null | undefined, n?: number) {
    let found: boolean
    this.walk(tag => {
      if (tag.name == name) found = true
      if (attrs) {
        const entries = Object.entries(attrs)
        if (!entries.length) {
          if (name) {
            if (found && !tag.rawAttrs) return tag.select()
            found = false
            return false
          } else if (!tag.rawAttrs) return tag.select()
        }
        else {
          const _attrs = tag.attrs()
          if (attrs['']) return tag.select()
          found = entries.every(([k, v]) => _attrs[k] && (v === true || _attrs[k] === v))
        }
      }
      if (found) return tag.select()
      found = false
    })
    return this
  }

  get attrs(): Attrs {
    return this.selected?.attrs ?? parseAttrs(this.selected?.rawAttrs) ?? null
  }

  get closeTag(): HTMLTagPos | null {
    if (this.selected && !this.selected?.closeTag) this.selected.closeTag = getCloseTagPos(this.HTML, this.selected.index, this.selected.name)
    return this.selected?.closeTag ?? null
  }

  set closeTag(val) {
    if (this.selected) this.selected.closeTag = val
  }

  get element(): string | null {
    if (!this.selected || !this.closeTag) return null
    return this.HTML.slice(this.selected.index, this.closeTag[0])
  }

  get text() {
    let el = this.element
    let match
    if (el) match = HTMLTAGTEXT().exec(el)
    if (match) return (match[1] ?? '') + (match[2] ?? '')
    return null
  }

  remove() {
    let el = this.element
    if (el) this.HTML = this.HTML.replace(new RegExp(`\\s*${el}`), '')
    this.selected = null
    return this
  }

  add(element: string, where?: 'before'|'prepend'|'append'|'after') {
    let index;
    if (this.selected) {
      if (where === 'before') index = this.selected.index
      if (where === 'prepend') index = this.selected.index + this.selected.raw.length
      if (!index && this.closeTag) {
        if (where === 'append') index = this.closeTag[0] - this.closeTag[1].length
        if (where === 'after') index = this.closeTag[0]
      }
    }
    if (index) {
      // Add to HTML
      this.HTML = this.HTML.slice(0, index) + element + this.HTML.slice(index)
      // Re compute indexes for selected tag
      if (where === 'before') this.selected!.index += element.length
      // if (where !== 'after')  if (this.closeTag) this.closeTag = [this.closeTag[0]+element.length, this.closeTag[1]]
    }
    return this
  }
}
