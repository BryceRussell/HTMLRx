import { describe, expect, it } from 'vitest'
import { isHTMLTag, isHTMLTagOpen, isHTMLTagClose, tagWithName, matchTag, getTagClose } from '~/index'

describe('HTMLRx Class', () => {
  // <!DOCTYPE html>
  const page = `
    <html dark>
    <!-- test -->
      <head>
        <meta charset="utf-8">
        <title>Test Page</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <header>
          <nav>
            <ul>
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </nav>
        </header>
        <main>
          <h1 num=1>Welcome to my test page</h1>
          <p>This is a test page that includes all the basic HTML elements.</p>
          <form>
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required/>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required/>
            <label for="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
            <button type="submit">Send</button>
          </form>
        </main>
        <footer>
          <p>Copyright &copy; 2023</p>
        </footer>
      </body>
    </html>
  `

  const HTMLTests = [
    '<html></html>',
    '<html lang="en"></html>',
    '<details open></details>',
    '<html><body></body></html>',
    '<html lang="en"><body class="dark" data-theme="dark">Descriptive Text</body></html>',
    page,
  ]

  const ATTRS: string[] = ['for','type','href','required','num','dark']

  it('Test isHTMLTag() / HTMLTAG', () => {
    // Open Tags
    expect(isHTMLTag(`<h1>`)).toBe(true)
    expect(isHTMLTag(`<h1 class="test">`)).toBe(true)
    expect(isHTMLTag(`<details open>`)).toBe(true)
    expect(isHTMLTag(`<h1 id="one" class="test">`)).toBe(true)
    expect(isHTMLTag(`<h1 id='one" class="test'>`)).toBe(true)
    expect(isHTMLTag(`<input type="text" required />`)).toBe(true)
    expect(isHTMLTag(`<input id="search"type="text"required/>`)).toBe(true)
    expect(isHTMLTag(`<\ninput\ntype="text"\nrequired\n/>`)).toBe(true)
    // Closing Tags
    expect(isHTMLTag(`</h1>`)).toBe(true)
    expect(isHTMLTag(`</\nh1\n>`)).toBe(true)
    expect(isHTMLTag(`</h1 class="test">`)).toBe(true)
    expect(isHTMLTag(`</input type="text" required />`)).toBe(true)
    expect(isHTMLTag(`</\ninput\ntype="text"\nrequired\n/>`)).toBe(true)
    // Empty tags
    expect(isHTMLTag(`<>`)).toBe(false)
    expect(isHTMLTag(`</ >`)).toBe(false)
    expect(isHTMLTag(`< />`)).toBe(false)
    expect(isHTMLTag(`</ \n />`)).toBe(false)
    expect(isHTMLTag(`< \n >`)).toBe(false)
  })

  it(`Test isHTMLTagOpen() / HTMLTAGOPEN`, () => {
    // Open Tags
    expect(isHTMLTagOpen(`<h1>`)).toBe(true)
    expect(isHTMLTagOpen(`<h1 class="test">`)).toBe(true)
    expect(isHTMLTagOpen(`<details open>`)).toBe(true)
    expect(isHTMLTagOpen(`<h1 id="one" class="test">`)).toBe(true)
    expect(isHTMLTagOpen(`<h1 id='one" class="test'>`)).toBe(true)
    expect(isHTMLTagOpen(`<input type="text" required />`)).toBe(true)
    expect(isHTMLTagOpen(`<input id="search"type="text"required/>`)).toBe(true)
    expect(isHTMLTagOpen(`<\ninput\ntype="text"\nrequired\n/>`)).toBe(true)
    // Closing Tags
    expect(isHTMLTagOpen(`</h1>`)).toBe(false)
    expect(isHTMLTagOpen(`</\nh1\n>`)).toBe(false)
    expect(isHTMLTagOpen(`</h1 class="test">`)).toBe(false)
    expect(isHTMLTagOpen(`</input type="text" required />`)).toBe(false)
    expect(isHTMLTagOpen(`</\ninput\ntype="text"\nrequired\n/>`)).toBe(false)
    // Empty tags
    expect(isHTMLTagOpen(`<>`)).toBe(false)
    expect(isHTMLTagOpen(`</ >`)).toBe(false)
    expect(isHTMLTagOpen(`< />`)).toBe(false)
    expect(isHTMLTagOpen(`</ \n />`)).toBe(false)
    expect(isHTMLTagOpen(`< \n >`)).toBe(false)
  })

  it(`Test isHTMLTagClose() / HTMLTAGCLOSE`, () => {
    // Open Tags
    expect(isHTMLTagClose(`<h1>`)).toBe(false)
    expect(isHTMLTagClose(`<h1 class="test">`)).toBe(false)
    expect(isHTMLTagClose(`<h1 id="one" class="test">`)).toBe(false)
    expect(isHTMLTagClose(`<h1 id='one" class="test'>`)).toBe(false)
    expect(isHTMLTagClose(`<details open>`)).toBe(false)
    expect(isHTMLTagClose(`<input type="text" required />`)).toBe(false)
    expect(isHTMLTagClose(`<input id="search"type="text"required/>`)).toBe(false)
    expect(isHTMLTagClose(`<\ninput\ntype="text"\nrequired\n/>`)).toBe(false)
    // Closing Tags
    expect(isHTMLTagClose(`</h1>`)).toBe(true)
    expect(isHTMLTagClose(`</\nh1\n>`)).toBe(true)
    expect(isHTMLTagClose(`</h1 class="test">`)).toBe(true)
    expect(isHTMLTagClose(`</input type="text" required />`)).toBe(true)
    expect(isHTMLTagClose(`</\ninput\ntype="text"\nrequired\n/>`)).toBe(true)
    // Empty tags
    expect(isHTMLTagClose(`<>`)).toBe(false)
    expect(isHTMLTagClose(`</ >`)).toBe(false)
    expect(isHTMLTagClose(`< />`)).toBe(false)
    expect(isHTMLTagClose(`</ \n />`)).toBe(false)
    expect(isHTMLTagClose(`< \n >`)).toBe(false)
  })

  it('Get an HTML tag with a specific attribute, matchTag()', () => {
    const params = [
      ['html', 'dark'],
      [null, 'href'],
      [null, 'num'],
      [null, null, '9'],
      [null, null, 'required'],
      ['details', 'class', 'test'],
      ['input', 'type', 'email'],
      ['nonexistent']
    ]

    for (const param of params) {
      const regex = matchTag(...param)
      expect(regex.exec(page)).toMatchSnapshot(param.toString()+' | '+regex.source)
    }
  })

  it('Get close tag from open tag index, getTagClose()', () => {
    for (const attr of ATTRS) {
      const reg = matchTag(null, attr)
      const first = reg.exec(page)!
      expect(first).not.toBe(null)
      const close = getTagClose(page, first.index)!
      expect(close).not.toBe(null)
      expect([
        first[0],
        close[0],
        page.slice(first.index, close[1])
      ]).toMatchSnapshot(attr)
    }
  })

  /* Old tests for HTMLTagPosMap (Map<string, number[]>) of open/close tags */
  // it('Get closing tags', () => {
  //   for (const test of HTMLTests) {
  //     const tags = getClosingTags(test)
  //     for (const [tag, indexes] of tags) {
  //       for (const i of indexes) {
  //         expect(test.slice(i - tag.length - 3, i)).toBe(`</${tag}>`)
  //       }
  //     }
  //   }
  // })
  // it('Get open tags', () => {
  //   for (const test of HTMLTests) {
  //     const tags = getOpenTags(test)
  //     for (const [tag, indexes] of tags) {
  //       for (const i of indexes) {
  //         expect(test.slice(i, i + 1 + tag.length)).toBe(`<${tag}`)
  //       }
  //     }
  //   }
  // })
  // it('Get raw tags', () => {
  //   for (const test of HTMLTests) {
  //     const tags = getOpenTagsRaw(test)
  //     for (const [tag, indexes] of tags) {
  //       for (const i of indexes) {
  //         expect(test.slice(i, i + tag.length)).toBe(tag)
  //       }
  //     }
  //   }
  // })
  // it('Get attributes from raw tags', () => {
  //   for (const test of HTMLTests) {
  //     const openTags = getOpenTagsRaw(test)
  //     const rawTags = getAllAttributes(openTags)
  //     for (const [tag, attrs] of rawTags.entries()) {
  //       const hasTag = test.includes(tag)
  //       for (const [attr, val] of Object.entries(attrs)) {
  //         const hasAttrs =
  //           (tag.includes(`${attr} `)) ||
  //           (tag.includes(` ${attr} `)) ||
  //           (tag.includes(` ${attr}`)) ||
  //           (tag.includes(`${attr}="${val}"`)) ||
  //           (tag.includes(`${attr}='${val}'`)) ||
  //           (tag.includes(`${attr}=${val}`))
  //           console.log('HEREEER: ', hasTag, hasAttrs)
  //         expect(hasTag && hasAttrs).toBe(true)
  //       }
  //     }
  //   }
  // })
})
