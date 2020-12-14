# restrict-scroll

A tiny library to restrict scrolling to a single element and its children.

## Why use this library instead of libary X, Y, or Z?

Most solutions to this problem rely on tweaking the CSS of various elements on the fly to effectively make them unscrollable by making their `overflow` CSS property be `none`. While this is an easy and effective solution it can cause jarring page reflows as scrollbars can appear/disappear on the page.

`restrict-scroll` instead listens to various events, intercepting them, and preventing elements from being scrolled.

## How to use

`npm install restrict-scroll`

or

`yarn add restrict-scroll`

and then in your javascript

```
import restrictScroll from 'restrict-scroll';

const scrollableElement = document.getElementById('my-scroller');
const scroller = restrictScroll(scrollableElement);
```

## API

Restricting scrolling on a page is as simple as calling `restrictScroll()` or `restrictScroll(element)`.

### set(<element>)

Updates the element that can be scrolled. If no element is passed to the `set` or `restrictScroll` functions, by default ALL scrolling on the page in every element is disabled. If an element is passed to the function, then scrolling is limited to occurring within that element and all of that element's child elements.

### off()

Enables scrolling on all elements on the page.

### on()

Disables scrolling on every element on the page _except_ for the element specified within the `set` function or passed to the `restrictScrolling` function.
