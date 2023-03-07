type Tag = [string, number];
type Attributes = Record<string, string | null | undefined>;
type TagMap = Map<string, number[]>;
type AllAttributes = Record<string, Attributes>;

/**
 * Matches declaration tags: `<! >`
 *
 * @type {RegExp}
 * @const DECLARATION
 */
export const HTMLDECLARATION = /<!([^>]*)>/g

/**
 * Matches HTML comments: `<!-- -->`
 *
 * @type {RegExp}
 * @const HTMLCOMMENT
 */
export const HTMLCOMMENT = /<!--([\s\S]*?)-->/g


/**
 * Matches any open or closed html tag
 *
 * @type {RegExp}
 * @const CLOSETAGS
 */
export const HTMLTAG = /<[^>]*>/g

/**
 * Matches the closing tag of an HTML element: `</div>`
 *
 * @type {RegExp}
 * @const CLOSETAGS
 */
export const HTMLTAGCLOSE = /<\s*\/\s*([^\s>]+)\s*>/g

/**
 * Matches the start of a HTML element's open tag: `<div`
 *
 * @type {RegExp}
 * @const OPENTAGSEMPTY
 */
export const HTMLTAGOPEN = /<([^\/][^\s>]*)/g

/**
 * Matches the the full open tag of an HTML element: `<input type="email" required/>`
 *
 * @type {RegExp}
 * @const OPENTAGSFULL
 */
export const HTMLTAGOPENRAW = /<[^\/]([^ >]*)([^>]*?)\/?>/g

/**
 * Match key/values pairs in a raw attribute string: `type="email" required`
 *
 * @type {RegExp}
 * @const ATTRIBUTES
 */
export const ATTRIBUTES = /(\w+)(?:=("[^"]*"|'[^']*'|[^'"\s]*)|)/g

/**
 * Creates a regex pattern to match the full raw open tag of a tag name/s
 *
 * @param {string|string[]} tag - HTML element tag/s regex will match
 * @param {string} flags - 
 * @returns {number} The sum of the two numbers.
 */
export function GETRAWOPENTAG(tag: string | string[], flags: string): RegExp {
  return RegExp(`/<${typeof tag === 'string' ? tag : `(${tag.join('|')})`}([^>]*)\/?>/${flags}`)
}

/**
 * Creates a regular expression pattern to match occurrences of an attribute in a string of HTML.
 *
 * @param {string|string[]} tag - The HTML element tag or tags that the regular expression should match.
 *                                 Can be a string or an array of strings.
 * @param {string} flags - Optional flags to use when creating the regular expression pattern.
 * @returns {RegExp} A regular expression object that matches the specified attribute in an HTML string.
*/
export function GETATTRIBUTE(attr: string | string[], flags: string): RegExp {
  return RegExp(`/${typeof attr === 'string' ? attr : `(${attr.join('|')})`}=["']([^"']*)["']/${flags}`)
}

export function getClosingTags(html: string): TagMap {
  const tags = new Map()
  let match
  while ((match = HTMLTAGCLOSE.exec(html)) !== null) {
    const tag = match[1] as string
    const index = match.index + tag.length + 3
    if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), index])
    else tags.set(tag, [index])
  }
  return tags
}

export function getOpenTags(html: string): TagMap {
  const tags = new Map()
  let match
  while ((match = HTMLTAGOPEN.exec(html)) !== null) {
    const tag = match[1] as string
    const index = match.index
    if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), index])
    else tags.set(tag, [index])
  }
  return tags
}

export function getOpenTagsRaw(html: string, tagsWithAttributesOnly?: boolean): TagMap {
  const tags = new Map()
  let match
  while ((match = HTMLTAGOPENRAW.exec(html)) !== null) {
    const tag = match[0]
    const index = match.index
    if (tags.has(tag)) tags.set(tag, [...(tags.get(tag) as number[]), index])
    else tags.set(tag, [index])
  }
  return tags
}

export function getAllAttributes(openTagsRaw: TagMap): AllAttributes {
  const allAttributes: AllAttributes = {}
  for (const tag of openTagsRaw.keys()) {
    const unwrap = tag.replace(/^<|(\/>|>)$/g, '')
    const [, attributesRaw] = unwrap.split(/\s+/)
    if (!attributesRaw) continue
    let match
    while ((match = ATTRIBUTES.exec(attributesRaw)) !== null) {
      const key = match[1]!
      const val = match[2] || match[3] || match[4] || null
      allAttributes[tag] = allAttributes[tag] || {}
      allAttributes[tag]![key] = val
    }
  }
  return allAttributes
}

/**
 * Transform strings of HTML
 * 
 * @class HTMLRx
 */
export class HTMLRx {
  public HTML: string
  private _closeTags: TagMap | undefined
  private _openTags: TagMap | undefined
  private _rawTags: TagMap | undefined
  public selected: Tag[] = []

  /**
   * Initialize HTMLRx transformer
   *
   * @param {string} html - a string of HTML
   */
  constructor(html: string) {
    this.HTML = html
  }

  toString() {
    return this.HTML
  }

  //  Lazy initialization tag map
  get closeTags() {
    if (!this._closeTags) this._closeTags = getClosingTags(this.HTML)
    return this._closeTags
  }
  get openTags() {
    if (!this._openTags) this._openTags = getOpenTags(this.HTML)
    return this._openTags
  }
  get rawTags() {
    if (!this._rawTags) this._rawTags = getOpenTagsRaw(this.HTML)
    return this._rawTags
  }

  select(tag?: string, attrs?: Attributes, n: number | boolean = false): void {
    const results: Tag[] = []
      // ...
    n === true
      ? (this.selected = [...results])
      : n === false || n < 2
      ? (this.selected = [results[0]!])
      : results.slice(0, n)
  }

  element(rawTag: Tag): string[] | string | undefined {
    const [tag, index] = rawTag
    const openIndexes = tag && this.openTags.get(tag) || []
    const closeIndexes = tag && this.closeTags.get(tag) || []

    if (openIndexes.length === 1) {
      if (closeIndexes.length === 0) return this.HTML.slice(openIndexes[0], openIndexes[0]! + tag!.length)
      if (closeIndexes.length === 1) return this.HTML.slice(openIndexes[0], closeIndexes[0])
    }
  }
}