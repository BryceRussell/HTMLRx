# HTMLRx

> Work in progress, subject to change

Manipulate strings of HTML using a regex based toolkit with no AST

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

const newHTML = HTMLRx(html)
  .clean() // Remove HTML comments
  .select('ul') // Select first 'ul' element

  // Once an element is selected you can:
  
  // Change the element's tag and/or attributes
  .modify('ol', {class: old => old + 'ordered'})
  // Remove everything from inside the element
  .empty()
  // Remove the element from the HTML
  .remove()

  // or

  // Return the element's attributes
  .attrs()
  // Return the full element as a string
  .element()
  // Return element's text
  .text()
```
### Using `.walk()`
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

const newHTML = HTMLRx(html)
  .walk(({index, name, attrs, select}) => {
    // Select every element and log it to the console
    select()
    console.log(this.element())
  })
  
```

## Example

```js
const html = `
  <div class="container">
    <h1>Title</h1>
    <p>Paragraph 1</p>
    <p>Paragraph 2</p>
    <img src="image.png" alt="Image">
  </div>
`

const newHTML = HTMLRx(html)
  .select(null, {class: 'container'})
  .modify('section', {class: 'new-class'})
  .select('h1')
  .modify('h2')
  .select('p')
  .empty()
  .select('img')
  .modify('figure', {class: 'image-container'})
  .HTML
```

```html
<section class="new-class">
  <h2>Title</h2>
  <p></p>
  <p>Paragraph 2</p>
  <figure src="image.png" alt="Image" class="image-container">
</section>
```
