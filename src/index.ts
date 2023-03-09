
import type {
  HTMLTagPosition,
  HTMLTagPositionMap,
  AttributesObj,
  HTMLAttributesMap,
  ParseHTMLAttributes,
} from '~/types'

const VOID_TAGS = ['meta','link','img','input','hr','br','source','param','area','base','col','command','embed','keygen','track','wbr']

export const HTMLDECLARATION = /<!([^>]*)>/g
export const HTMLCOMMENT = /<!--([\s\S]*?)-->/g
export const HTMLTAG = /<(\/?)\s*([^\s\/>]+)(?:\s*[^\/\s>]+)*\s*(\/?)>/g
export const HTMLTAGSTART = /<(\/?)\s*([^\/][^\s>]+)/g
export const HTMLTAGOPENSTART = /<\s*([^\/][^\s>]+)/g
export const HTMLTAGOPEN = /<([^\/][^\s>]*)([^>]*?)\/?>/g
export const HTMLTAGCLOSE = /<\/\s*([^\s>]+)\s*>/g
export const PARSERAWATTRIBUTES = /(\w+)(?:=("[^"]*"|'[^']*'|[^'"\s]*)|)/g

export function tagWithName(tag: string | string[], flags: string = 'g'): RegExp {
  return new RegExp(`<${typeof tag === 'string' ? tag : `(${tag.join('|')})`}([^>]*?)\/?>`, flags)
}

export function allTags(tag: string | string[] = '[^\\s\\/>]+', flags: string = 'g'): RegExp {
  return new RegExp(HTMLTAG.source.replace(`([^\s\/>]+)`, `(${typeof tag === 'string' ? tag : tag.join('|')})`), flags)
}


export function tagWithAttribute(attr: string | string[], flags: string = 'g'): RegExp {
  return new RegExp(`<[^>]+(?:${attr}\\s*(?:=\\s*"([^"]+)"|=\\s*'([^']+)'|=\\s*([^\\s\/]+?))?)[^<>]*\/?>`, flags)
}

export const isHTMLTag = (str: string) => HTMLTAG.test(str)
export const isHTMLTagOpen = (str: string) => HTMLTAGOPEN.test(str)
export const isHTMLTagClose = (str: string) => HTMLTAGCLOSE.test(str)

export function getTagClosePos(html: string, startPos: number, tagName?: string): number|null {
  const TAGSTARTS = allTags(tagName)
  const fragment = html.slice(startPos)
  let open = 0;
  let match;
  while ((match = TAGSTARTS.exec(fragment)) !== null) {
    // Match: [1]: '/' if close tag, [2]: tag name, [3]: `/` if self closing tag 
    if (open <= 1) {
      // Check for self closing tags and tags that do not need `/>`
      if (match[3] || VOID_TAGS.includes(match[2]!)) return startPos + match[0].length
      // If tag is a closing tag and there is only 1 open tag in count, return its end index
      if (match[1]) return startPos + match.index + match[0].length
    }
    // If closing tag and there are nested open tags, decrease open tag count
    if (open > 0 && match[1]) open--
    // If nested open tag increase open tag count
    if (!match[1]) open++
  }
  return null
}