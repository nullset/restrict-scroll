# restrict-scroll

A small library to restrict scrolling to a single element and its children.

Note that while more than one element can be specified as potentially scrollable, only a single active scrollable element can be one the page at a time.

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
restrictScroll.add(scrollableElement);
```

## API

### list

Returns a list of elements which can be scrolled, in the order in which they were specified as scrollable. Note that there can be only a single "active" scrollable element at a time. If the "active" scrollable element is removed from the page (for example, a modal being closed) the next most recently added element in the list becomes "active" and scrolling is limited to _that_ element.

### activeElement

Returns the "active" scrollable element.

### add(`<element>`)

Updates the "active" element that can be scrolled. Any element that is set via `add` is appended to the list of potentially scrollable elements. Scrolling is limited to occurring within that element and all of that element's child elements.

### delete(`<element>`)

Scrolling is no longer restricted to the specified element. If another element was specified previously, that earlier element will become the "active" element. If no previous elements exist, then scrolling is enabled on all elements.

### clear()

Clears all elements from the list of scrollable elements. Every element becomes scrollable again.

### stop()

Enables scrolling on all elements on the page.

### run()

Disables scrolling on every element on the page _except_ for the element specified within the `add` function.
