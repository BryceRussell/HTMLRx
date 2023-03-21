# htmlrx

## 0.0.2

### Patch Changes

- 4622452: Start on prototyping:

  - `matchEach()` Recursive regex callback loop
  - `walk()` Loop over all open tags in the HTML
  - `clean()` Clean html from stuff like comments
  - `compress()` Remove whitespace from between elements
  - `select()` Select an open tag
  - `modify()` Modify a tag's name and/or attributes
  - `empty()` Empty everything from the selected tag
  - `remove()` Remove the selected tag from HTML
  - `attrs()` Get the selected elements attributes
  - `element()` Get the slected full element
  - `text()` Get the selected elements text

## 0.0.1

### Minor Changes

- d7ca069: **Setup package foundation**:
  - Setup types
  - Create basic regex patterns for open tags, closed tags, attributes, comments, etc
  - Create functions for initialization of HTMLRx class
  - Tiny start on an API for HTMLRx class
  - Tiny start on adding JSDoc comments

### Patch Changes

- ed7258b: Initial chores

  - Add `ci` and `release` scripts to `package.json`
  - Fixed github workflows to use new scripts
  - Add `LICENSE
  - Add `.npmignore`
  - Add `vite.config.ts`
  - Add `.nvmrc`
