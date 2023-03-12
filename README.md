# HTMLRx

> A regex-based toolkit for proccessing strings of HTML

# How to use

```ts
import { HTMLRx } from 'htmlrx`;

const html = `
  <detail open class="dropdown">
    <summary>Open<summary>
    <ul>
      <li><a href="">One</a></li>
      <li><a href="">Two</a></li>
      <li><a href="">Three</a></li>
    </ul>
  </details>
`

const new = HTMLRx(html)
  .clean()
  .select('ul')
  

// Get the selected element's attributes
const attrs - new.attrs()
// Get the selected element as a string
const element = new.element()
// Get the selected element's text
const text = new.text()
// Remove element from HTML
new.remove()

console.log(new.HTML)
```
## Using `.walk()`
```ts
import { HTMLRx } from 'htmlrx`;

const html = '
  <detail open class="dropdown">
    <summary>Open<summary>
    <ul>
      <li><a href="">One</a></li>
      <li><a href="">Two</a></li>
      <li><a href="">Three</a></li>
    </ul>
  </details>
'

// Iterate over each open tag
const new = HTMLRx(html)
  .walk(({name, text}) => {
    if (name === ''summary) console.log(text())
  })
  
```
