import { type } from 'arktype'
import { HTMLTAG, HTMLTAGCLOSE, HTMLTAGOPEN, HTMLTAGOPENRAW } from '~/index'

export const matchRegex = (str: string, exp: RegExp, msg: string = '') => {
  const match = type({ exp })
  const { data, problems } = match({ exp: str })
  if (data) return data.exp
  const log = `matchRegex(): '${str}' does not match ${msg ? `${msg}: ${exp}` : exp}\n`
  throw new Error(log)
}

export const isHTMLTag = (str: string) => matchRegex(str, HTMLTAG, `a HTML tag`)
export const isHTMLTagOpen = (str: string) => matchRegex(str, HTMLTAGOPEN, `a open HTML tag`)
export const isHTMLTagClose = (str: string) => matchRegex(str, HTMLTAGCLOSE, `a closed HTML tag`)

const tag = `<open>`
console.log(isHTMLTag(tag))
console.log(isHTMLTagOpen(tag))
console.log(isHTMLTagClose(tag))
