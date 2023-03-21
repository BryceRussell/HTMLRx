import type { Attrs, HTMLTagPos, HTMLTagSelected, ReturnText } from '~/types'

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
const _PARSEATTRIBUTES = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([\w-]+)))?/
const _HTMLTAGTEXT = />([^<]*)[^]*(?<=>([^<]*)<)/

export const HTMLDECLARATION = (flags: string = 'g') => new RegExp(_HTMLDECLARATION.source, flags)
export const HTMLCOMMENT = (flags: string = 'g') => new RegExp(_HTMLCOMMENT.source, flags)

export const HTMLTAG = (tag: string | string[] = '[^\\s\\/>]+', flags: string = 'g'): RegExp => {
  let regex = _HTMLTAG.source
  if (tag) regex = regex.replace(`[^\\s\\/>]+`, typeof tag === 'string' ? tag : tag.join('|'))
  return new RegExp(regex, flags)
}

export const HTMLTAGOPEN = (flags: string = 'g') => new RegExp(_HTMLTAGOPEN.source, flags)
export const HTMLTAGCLOSE = (flags: string = 'g') => new RegExp(_HTMLTAGCLOSE.source, flags)
export const PARSEATTRIBUTES = (flags: string = 'g') => new RegExp(_PARSEATTRIBUTES.source, flags)
export const HTMLTAGTEXT = (flags: string = 'g') => new RegExp(_HTMLTAGTEXT.source, flags)

function eachMatch<T>(exp: RegExp, str: (() => string) | string, callback: (match: RegExpExecArray) => T): T | null {
  let result: T
  const traverse = () => {
    let string = typeof str === 'string' ? str : str()
    let match = exp.exec(string)
    if (match !== null) {
      result = callback(match)
      if (!result) traverse()
      return result
    }
    return null
  }
  return traverse()
}

function parseAttrs(rawAttrs: string | null | undefined) {
  let obj: Attrs = {}
  if (rawAttrs) {
    eachMatch(PARSEATTRIBUTES(), rawAttrs, (match) => {
      const key = match?.[1]
      if (key) obj[key] = match[2] ?? match[3] ?? match[4] ?? true
    })
  }
  return obj
}

function attrString(attrs: Attrs): string {
  let str = ''
  for (const [k, v] of Object.entries(attrs)) {
    str += ` ${k}="${v}"`
  }
  return str
}

function findCloseTag(html: string, index: number, name?: string): HTMLTagPos | undefined {
  let tag: HTMLTagPos | undefined
  let count = 0
  const regex = HTMLTAG(name)
  eachMatch(regex, html.slice(index), (match) => {
    if (count <= 1) {
      if (match[1]) {
        tag = [index + match.index + match[0].length, match[0]]
        return true
      }
      if (match[4] || VOID_TAGS.includes(match[2]!)) {
        tag = [index + match[0].length, match[0]]
        return true
      }
    }
    if (count > 0 && match[1]) count--
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

  splice(str: string, start: number, end: number = start) {
    this.HTML = this.HTML.slice(0, start) + str + this.HTML.slice(end)
    // Update selected index
    if (this.selected?.index && start < this.selected.index) this.selected.index += str.length - (end - start)
    // Update close tag index
    if (this.closeTag && start < this.closeTag[0]) this.closeTag[0] += str.length - (end - start)
  }

  get closeTag(): HTMLTagPos | null {
    if (this.selected && !this.selected.closeTag)
      this.selected.closeTag = findCloseTag(this.HTML, this.selected!.index, this.selected!.name)
    return this.selected?.closeTag ?? null
  }

  set closeTag(val) {
    if (this.selected) this.selected.closeTag = val
  }

  clean() {
    this.HTML = this.HTML.replace(/\s*<!--([\s\S]*?)-->/g, '')
    return this
  }

  compress() {
    this.HTML = this.HTML.replace(/>\s+</g, '><')
    // Need to update indexes after removing whitespace
    return this
  }

  walk(
    callback: (
      this: HTMLRx,
      tag: {
        index: number
        raw: string
        name: string
        rawAttrs: string
        attrs: () => Attrs
        selfClosing: boolean
        select: () => true
      }
    ) => boolean | null | undefined | void
  ): HTMLRx {
    eachMatch(
      HTMLTAGOPEN(),
      () => this.HTML,
      (m) => {
        const tag = {
          index: m.index,
          raw: m[0],
          name: m[1]!,
          rawAttrs: m[2] || '',
          selfClosing: !!m[3],
        }
        return callback.call(this, {
          ...tag,
          attrs: () => parseAttrs(tag.rawAttrs),
          select: () => {
            this.selected = tag
            return true
          },
        })
      }
    )
    return this
  }

  select(name?: string | null | undefined, attrs?: Attrs | null | undefined, n?: number) {
    let found: boolean
    this.walk((tag) => {
      if (tag.name == name) found = true
      if (attrs) {
        const entries = Object.entries(attrs)
        if (!entries.length) {
          if (name) {
            if (found && !tag.rawAttrs) return tag.select()
            found = false
            return false
          } else if (!tag.rawAttrs) return tag.select()
        } else {
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

  add(element: string, where: 'before' | 'prepend' | 'append' | 'after' = 'append') {
    let index
    if (this.selected) {
      if (where === 'before') index = this.selected.index
      if (where === 'prepend') index = this.selected.index + this.selected.raw.length
      if (!index && this.closeTag) {
        if (where === 'append') index = this.closeTag[0] - this.closeTag[1].length
        if (where === 'after') index = this.closeTag[0]
      }
    }
    if (index) {
      if (where === 'before') this.selected!.index += element.length
      if (where !== 'after') if (this.closeTag) this.closeTag = [this.closeTag[0] + element.length, this.closeTag[1]]
      this.HTML = this.HTML.slice(0, index) + element + this.HTML.slice(index)
    }
    return this
  }

  modify(name: string | null | undefined, attrs?: ((attrs?: Attrs) => Attrs) | Attrs | null, selfClosing?: boolean) {
    if (this.selected) {
      const newName = name ?? this.selected.name
      const newAttrs = typeof attrs === 'function' ? attrs(this.selected?.attrs) : attrs
      const rawAttrs = newAttrs ? attrString(newAttrs) : ''
      const openRaw = `<${newName}${rawAttrs}${selfClosing ? '/' : ''}>`
      const closeTag = this.closeTag
      const closeRaw = closeTag![1].replace(this.selected.name, newName)

      // Replace old open tag with new open tag
      this.splice(openRaw, this.selected.index, this.selected.index + this.selected.raw.length)
      // this.updateEndIndex(this.selected.raw.length, openRaw.length)

      if (name && closeTag) {
        this.splice(closeRaw, closeTag[0] - closeTag[1].length, closeTag![0])
        this.closeTag = [this.closeTag![0], closeRaw]
        // this.updateEndIndex(closeTag[1].length, closeRaw.length)
      }

      // Update 'selected' object with new values
      this.selected = {
        ...this.selected,
        raw: openRaw,
        name: newName,
        rawAttrs,
        selfClosing: selfClosing || this.selected.selfClosing,
        attrs: newAttrs ?? this.selected.attrs,
        element: undefined,
      }
    }
    return this
  }

  empty() {
    if (this.selected && this.closeTag) {
      this.splice('', this.selected.index + this.selected.raw.length, this.closeTag[0] - this.closeTag[1].length)
    }
    return this
  }

  remove() {
    if (this.selected && this.closeTag) {
      this.splice('', this.selected.index, this.closeTag[0])
    }
    this.selected = null
    return this
  }

  attrs(): Attrs {
    return this.selected?.attrs ?? parseAttrs(this.selected?.rawAttrs)
  }

  element(): string | null {
    if (this.selected && this.closeTag) {
      const el = this.HTML.slice(this.selected.index, this.closeTag[0])
      this.selected.element = el
      return el
    }
    return null
  }

  text<P extends 'before' | 'after' | 'both' | 'tuple' | undefined = undefined>(position?: P): ReturnText<P> {
    let el = this.selected?.element ?? this.element()
    let match
    if (el) match = HTMLTAGTEXT().exec(el)
    if (match) {
      position = position || ('before' as P)
      if (position === 'before') return match[1] as ReturnText<P>
      const after = match[2] !== match[1] ? match[2] : undefined
      if (position === 'after') return after as ReturnText<P>
      if (position === 'both') return ((match[1] ?? '') + (after ?? '')) as ReturnText<P>
      if (position === 'tuple') return [match[1], after] as ReturnText<P>
    }
    return null
  }
}
