import { describe, expect, it } from 'vitest'
import { HTMLRx, HTMLTAG, HTMLTAGOPEN } from '~/index'

describe('HTMLRx Class', () => {
  // <!DOCTYPE html>
  const page = `
    <html dark>
    <!-- test -->
      <head>
        <!-- test -->
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
              <li>
                <a>
                  <details class="test">
                    <summary>Open</summary>
                    <ul>
                      <li><a><svg></svg></a></li>
                      <li><a><svg><!-- test --></svg></a></li>
                      <li><a><svg></svg></a></li>
                    </ul>
                  </details>
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <h1 num=1>Welcome to my test page</h1>
          <p>This is a test page that includes all the basic HTML elements.</p>
          <form>
            <!-- test -->
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required/>
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required/>
            <label for="message">Message:</label>
            <textarea id="message" name="message" required></textarea>
            <button type="submit">Send</button>
            <!-- test -->
          </form>
        </main>
        <footer>
          <p>Copyright &copy; 2023</p>
        </footer>
      </body>
    </html>
    <!-- test -->
  `

  it('Regex: HTMLTAG', () => {
    const regex = HTMLTAG()
    // Open Tags
    expect(HTMLTAG().test((`<h1>`))).toBe(true)
    expect(HTMLTAG().test((`<h1 class="test">`))).toBe(true)
    expect(HTMLTAG().test((`<details open>`))).toBe(true)
    expect(HTMLTAG().test((`<h1 id="one" class="test">`))).toBe(true)
    expect(HTMLTAG().test((`<h1 id='one" class="test'>`))).toBe(true)
    expect(HTMLTAG().test((`<link rel="stylesheet" href="styles.css">`))).toBe(true)
    expect(HTMLTAG().test((`<input type="text" required />`))).toBe(true)
    expect(HTMLTAG().test((`<input id="search"type="text"required/>`))).toBe(true)
    expect(HTMLTAG().test((`<\ninput\ntype="text"\nrequired\n/>`))).toBe(true)
    // Closing Tags
    expect(HTMLTAG().test((`</h1>`))).toBe(true)
    expect(HTMLTAG().test((`</\nh1\n>`))).toBe(true)
    expect(HTMLTAG().test((`</h1 class="test">`))).toBe(true)
    expect(HTMLTAG().test((`</input type="text" required />`))).toBe(true)
    expect(HTMLTAG().test((`</\ninput\ntype="text"\nrequired\n/>`))).toBe(true)
    // Empty tags
    expect(HTMLTAG().test((`<>`))).toBe(false)
    expect(HTMLTAG().test((`</ >`))).toBe(false)
    expect(HTMLTAG().test((`< />`))).toBe(false)
    expect(HTMLTAG().test((`</ \n />`))).toBe(false)
    expect(HTMLTAG().test((`< \n >`))).toBe(false)
    expect(HTMLTAG().test((`Some text without HTML`))).toBe(false)
    expect(HTMLTAG().test((`12345`))).toBe(false)
  })

  it(`Regex: HTMLTAGOPEN`, () => {
    // Open Tags
    expect(HTMLTAGOPEN().test((`<h1>`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<h1 class="test">`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<details open>`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<h1 id="one" class="test">`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<h1 id='one" class="test'>`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<link rel="stylesheet" href="styles.css">`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<input type="text" required />`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<input id="search"type="text"required/>`))).toBe(true)
    expect(HTMLTAGOPEN().test((`<\ninput\ntype="text"\nrequired\n/>`))).toBe(true)
    // Closing Tags
    expect(HTMLTAGOPEN().test((`</h1>`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</\nh1\n>`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</h1 class="test">`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</input type="text" required />`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</\ninput\ntype="text"\nrequired\n/>`))).toBe(false)
    // Empty tags
    expect(HTMLTAGOPEN().test((`<>`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</ >`))).toBe(false)
    expect(HTMLTAGOPEN().test((`< />`))).toBe(false)
    expect(HTMLTAGOPEN().test((`</ \n />`))).toBe(false)
    expect(HTMLTAGOPEN().test((`< \n >`))).toBe(false)
    expect(HTMLTAGOPEN().test((`Some text without HTML`))).toBe(false)
    expect(HTMLTAGOPEN().test((`12345`))).toBe(false)
  })

  it('Tests: .clean() ', () => {
    const H = new HTMLRx(page).clean()
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            <head>
              <meta charset=\\"utf-8\\">
              <title>Test Page</title>
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            </head>
            <body>
              <header>
                <nav>
                  <ul>
                    <li><a href=\\"#\\">Home</a></li>
                    <li><a href=\\"#\\">About</a></li>
                    <li><a href=\\"#\\">Contact</a></li>
                    <li>
                      <a>
                        <details class=\\"test\\">
                          <summary>Open</summary>
                          <ul>
                            <li><a><svg></svg></a></li>
                            <li><a><svg></svg></a></li>
                            <li><a><svg></svg></a></li>
                          </ul>
                        </details>
                      </a>
                    </li>
                  </ul>
                </nav>
              </header>
              <main>
                <h1 num=1>Welcome to my test page</h1>
                <p>This is a test page that includes all the basic HTML elements.</p>
                <form>
                  <label for=\\"name\\">Name:</label>
                  <input type=\\"text\\" id=\\"name\\" name=\\"name\\" required/>
                  <label for=\\"email\\">Email:</label>
                  <input type=\\"email\\" id=\\"email\\" name=\\"email\\" required/>
                  <label for=\\"message\\">Message:</label>
                  <textarea id=\\"message\\" name=\\"message\\" required></textarea>
                  <button type=\\"submit\\">Send</button>
                </form>
              </main>
              <footer>
                <p>Copyright &copy; 2023</p>
              </footer>
            </body>
          </html>
        "
    `)
  })

  it('Tests: .compress() ', () => {
    const H = new HTMLRx(page)
      .clean()
      .compress()
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark><head><meta charset=\\"utf-8\\"><title>Test Page</title><link rel=\\"stylesheet\\" href=\\"styles.css\\"></head><body><header><nav><ul><li><a href=\\"#\\">Home</a></li><li><a href=\\"#\\">About</a></li><li><a href=\\"#\\">Contact</a></li><li><a><details class=\\"test\\"><summary>Open</summary><ul><li><a><svg></svg></a></li><li><a><svg></svg></a></li><li><a><svg></svg></a></li></ul></details></a></li></ul></nav></header><main><h1 num=1>Welcome to my test page</h1><p>This is a test page that includes all the basic HTML elements.</p><form><label for=\\"name\\">Name:</label><input type=\\"text\\" id=\\"name\\" name=\\"name\\" required/><label for=\\"email\\">Email:</label><input type=\\"email\\" id=\\"email\\" name=\\"email\\" required/><label for=\\"message\\">Message:</label><textarea id=\\"message\\" name=\\"message\\" required></textarea><button type=\\"submit\\">Send</button></form></main><footer><p>Copyright &copy; 2023</p></footer></body></html>
        "
    `)
  })

  it('Tests: .select() ', () => {

    const H = new HTMLRx(page).clean()
    H.select('html')  // First `html` tag
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 5,
        "name": "html",
        "raw": "<html dark>",
        "rawAttrs": " dark",
        "selfClosing": false,
      }
    `)
    H.select('details', {class:'test'})  // First `details` tag with `class="test"` as attributes
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 414,
        "name": "details",
        "raw": "<details class=\\"test\\">",
        "rawAttrs": " class=\\"test\\"",
        "selfClosing": false,
      }
    `)
    H.select('html', {dark:true})  // First `html` tag with `dark` attribute
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 5,
        "name": "html",
        "raw": "<html dark>",
        "rawAttrs": " dark",
        "selfClosing": false,
      }
    `)
    H.select('input', {type:'email', id: 'email'})  // First `input` tag with `type="email" id="email"` as attributes
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 1132,
        "name": "input",
        "raw": "<input type=\\"email\\" id=\\"email\\" name=\\"email\\" required/>",
        "rawAttrs": " type=\\"email\\" id=\\"email\\" name=\\"email\\" required",
        "selfClosing": true,
      }
    `)
    H.select('', {href: '#'})  // Any tag with `href="#"` attribute
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 239,
        "name": "a",
        "raw": "<a href=\\"#\\">",
        "rawAttrs": " href=\\"#\\"",
        "selfClosing": false,
      }
    `)
    H.select(null, {num: true})  // Any tag with `num` attribute
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 830,
        "name": "h1",
        "raw": "<h1 num=1>",
        "rawAttrs": " num=1",
        "selfClosing": false,
      }
    `)
    H.select(null, {'': true})  // Any tag with attributes
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 5,
        "name": "html",
        "raw": "<html dark>",
        "rawAttrs": " dark",
        "selfClosing": false,
      }
    `)
    H.select(null, {})  // Any tag with no attributes
    expect(H.selected).toMatchInlineSnapshot(`
      {
        "index": 23,
        "name": "head",
        "raw": "<head>",
        "rawAttrs": "",
        "selfClosing": false,
      }
    `)
  })

  it(`Tests: get selected attributes`, () => {
    const H = new HTMLRx(page).clean()
    H.select('body')  // First `html` tag
    expect(H.attrs()).toMatchInlineSnapshot('{}')
    H.select('html')  // First `html` tag
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "dark": true,
      }
    `)
    H.select('input')  // First `input` tag with `type="email" id="email"` as attributes
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "id": "name",
        "name": "name",
        "required": true,
        "type": "text",
      }
    `)
    H.select('details', {class:'test'})  // First `details` tag with `class="test"` as attributes
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "class": "test",
      }
    `)
    H.select('', {href: '#'})  // Any tag with `href="#"` attribute
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "href": "#",
      }
    `)
    H.select(null, {id: true})
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "id": "name",
        "name": "name",
        "required": true,
        "type": "text",
      }
    `)
    H.select(null, {num: true})  // Any tag with `num` attribute
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "num": "1",
      }
    `)
    H.select(null, {'': true})  // Any tag with attributes
    expect(H.attrs()).toMatchInlineSnapshot(`
      {
        "dark": true,
      }
    `)
    H.select(null, {})  // Any tag with no attributes
    expect(H.attrs()).toMatchInlineSnapshot('{}')
  })

  it('Tests: .remove()', () => {
    const H = new HTMLRx(page)
      .clean()
      .select('body')
      .remove()

      expect(H.HTML).toMatchInlineSnapshot(`
        "
            <html dark>
              <head>
                <meta charset=\\"utf-8\\">
                <title>Test Page</title>
                <link rel=\\"stylesheet\\" href=\\"styles.css\\">
              </head>
              
            </html>
          "
      `)

    H.select('link')
      .remove()

      expect(H.HTML).toMatchInlineSnapshot(`
        "
            <html dark>
              <head>
                <meta charset=\\"utf-8\\">
                <title>Test Page</title>
                
              </head>
              
            </html>
          "
      `)

    H.select('head')
      .remove()

      expect(H.HTML).toMatchInlineSnapshot(`
        "
            <html dark>
              
              
            </html>
          "
      `)
  })

  it('Tests: .add()', () => {
    const H = new HTMLRx(page)
      .clean()
      .select('body')
      .remove()
      .select('meta')
      .remove()
      .select('title')
      .remove()
      .select('head')
      .add('TEST', 'append')
      .add('TEST', 'before')
      .add('TEST', 'prepend')
      .add('TEST', 'after')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<head>TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST</head>TEST
            
          </html>
        "
    `)
      
    H.add('<link rel="append" href="append.css">')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<head>TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST<link rel=\\"append\\" href=\\"append.css\\"></head>TEST
            
          </html>
        "
    `)

    H.add('<link rel="prepend" href="prepend.css">', 'prepend')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<head><link rel=\\"prepend\\" href=\\"prepend.css\\">TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST<link rel=\\"append\\" href=\\"append.css\\"></head>TEST
            
          </html>
        "
    `)

    H.add('<!-- "Before" -->', 'before')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<!-- \\"Before\\" --><head><link rel=\\"prepend\\" href=\\"prepend.css\\">TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST<link rel=\\"append\\" href=\\"append.css\\"></head>TEST
            
          </html>
        "
    `)

    H.add(`
      <body>
        <main>
          <input type="email" id="email" name="email" required/>
        </main>
      </body>
    `, 'after')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<!-- \\"Before\\" --><head><link rel=\\"prepend\\" href=\\"prepend.css\\">TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST<link rel=\\"append\\" href=\\"append.css\\"></head>
            <body>
              <main>
                <input type=\\"email\\" id=\\"email\\" name=\\"email\\" required/>
              </main>
            </body>
          TEST
            
          </html>
        "
    `)

    H.add('TEST', 'prepend')
      .add('TEST', 'after')
      .add('TEST', 'append')
      .add('TEST', 'before')
    expect(H.HTML).toMatchInlineSnapshot(`
      "
          <html dark>
            TEST<!-- \\"Before\\" -->TEST<head>TEST<link rel=\\"prepend\\" href=\\"prepend.css\\">TEST
              
              
              <link rel=\\"stylesheet\\" href=\\"styles.css\\">
            TEST<link rel=\\"append\\" href=\\"append.css\\">TEST</head>TEST
            <body>
              <main>
                <input type=\\"email\\" id=\\"email\\" name=\\"email\\" required/>
              </main>
            </body>
          TEST
            
          </html>
        "
    `)
  })


})
