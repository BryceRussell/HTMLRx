import { describe, expect, it } from 'vitest'
import { HTMLRx, getClosingTags, getOpenTags, getOpenTagsRaw, getAllAttributes } from './src/index'

describe('HTMLRx Class', () => {
  // <!DOCTYPE html>
  const page = `
    <html>
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
          <h1>Welcome to my test page</h1>
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

  const H = new HTMLRx(page)

  it('Get closing tags', () => {
    for (const test of HTMLTests) {
      const tags = getClosingTags(test)
      for (const [tag, indexes] of tags) {
        for (const i of indexes) {
          expect(test.slice(i - tag.length - 3, i)).toBe(`</${tag}>`)
        }
      }
    }
  })

  it('Get open tags', () => {
    for (const test of HTMLTests) {
      const tags = getOpenTags(test)
      for (const [tag, indexes] of tags) {
        for (const i of indexes) {
          expect(test.slice(i, i + 1 + tag.length)).toBe(`<${tag}`)
        }
      }
    }
  })

  it('Get raw tags', () => {
    for (const test of HTMLTests) {
      const tags = getOpenTagsRaw(test)
      for (const [tag, indexes] of tags) {
        for (const i of indexes) {
          expect(test.slice(i, i + tag.length)).toBe(tag)
        }
      }
    }
  })

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
