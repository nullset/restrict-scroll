# restrict-scroll

A small library to restrict scrolling to a single element and its children. Only two dependencies.

Note that while more than one element can be specified as potentially scrollable, only a single active scrollable element will be recognized a time.

## Notable updates

### 1.3.14

Fix error that can occur if restrit-scroll tries to handle a keyboard event for an element that has already been removed from the DOM. Thanks (@erezny)[https://github.com/erezny]!

### 1.3.13

Arrow/page/etc. key up and down events used to be prevented wholesale, as they can affect what is scrolled on the screen. We now try to be smarter about this, and allow these events but only if the element that the event is happening on is an "editable" element (ex. an `<input>`, `<textarea>`, or `contenteditable` element). This allows for normal key navigation within these elements without affecting scroll position.

### 1.3.10

Expose restrictScroll on the window object. While global objects suck, it's the only way to ensure that package managers are always using the same instance of restrictScroll, and which allows users to import restrictScroll multiple times in various modules without creating a new instance.

### 1.3.6

Correctly handle when the space bar is used for scrolling.

### 1.3.0

Now correctly handles up/down arrow, page up/down, home/end events when focused inside the scrollable area.

## Why use this library instead of libary X, Y, or Z?

Most solutions to this problem rely on tweaking the CSS of various elements on the fly to effectively make them unscrollable by making their `overflow` CSS property be `none`. While this is an easy and effective solution it can cause jarring page reflows as scrollbars can appear/disappear on the page.

`restrict-scroll` instead listens to various events that can trigger a scroll, intercepts them, and prevents elements from being scrolled.

## How to use

`npm install restrict-scroll`

or

`yarn add restrict-scroll`

and then in your javascript

```
import restrictScroll from 'restrict-scroll';
const scrollableElement = document.getElementById('my-scroller');

// Either ...

// Allow scrolling on parent element, and allow scrolling on any child elements
restrictScroll.add(scrollableElement);

// ... or ...

// Allow scrolling on parent element, and allow scrolling on any child elements
restrictScroll.add(scrollableElement, { scrollChildren: true });

// ... or ...

// Allow scrolling on parent element, but prevent scrolling on any child elements
restrictScroll.add(scrollableElement, { scrollChildren: false });
```

## Run locally

To see a demo page, simply `npm run start`.

## API

### list

Returns a list of elements which can be scrolled, in the order in which they were specified as scrollable. Note that there can be only a single "active" scrollable element at a time. If the "active" scrollable element is removed from the page (for example, a modal being closed) the next most recently added element in the list becomes "active" and scrolling is limited to _that_ element.

### activeElement

Returns the "active" scrollable element.

### add(`<element>`, `{ scrollChildren: true }`)

Updates the "active" element that can be scrolled. Any element that is set via `add` is appended to the list of potentially scrollable elements. Scrolling is limited to occurring within that most recently added element and all of that element's child elements.

If it is known that children are not scrollable (because they have no `overflow` CSS property set) a performance boost can be had by setting the `scrollChildren` option to `false` (by default `scrollChildren` is set to `true`).

### delete(`<element>`)

Scrolling is no longer restricted to the specified element. If another element was specified previously, that earlier element will become the "active" element. If no previous elements exist, then scrolling is enabled on all elements.

### clear()

Clears all elements from the list of scrollable elements. Every element becomes scrollable again.

### stop()

Enables scrolling on all elements on the page.

### run()

Disables scrolling on every element on the page _except_ for the element specified within the `add` function. By default any time you `add` an element the `run` function is called, so you likely don't need to call `run` unless you've ever called `stop`.
