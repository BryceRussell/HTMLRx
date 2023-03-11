import Benchmark from 'benchmark'
import cheerio from 'cheerio';
import { HTMLRx } from './dist/index.mjs'

const input = `
    <html>
      <head>
        <meta charset="utf-8">
        <title>Test Page</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body data-true data-theme="dark">
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

const suite = new Benchmark.Suite()

suite
  .add('Regex 1', function () {
    const T = new HTMLRx(input)

    const test = T
      .walk(({name}, element) => {
          if (name === 'details') return element()
      })
  })
  .add('Regex 2', function () {
    const $ = cheerio.load(input);

    const test = $('input[type="text"]').html();
  })
  .on('cycle', function (event) {
    console.log(String(event.target))
  })
  .run({ async: true })
