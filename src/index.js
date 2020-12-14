import normalizeWheel from 'normalize-wheel';

let allowScrollingWithin = new Set();

function scrollableElement() {
  const arr = Array.from(allowScrollingWithin);
  for (let i = arr.length - 1; i >= 0; i--) {
    const node = arr[i];
    if (node && node.isConnected) {
      return node;
    } else {
      arr.splice(i, 1);
      allowScrollingWithin.delete(node);
    }
  }
}

const events = ['wheel', 'mousedown', 'keydown', 'scroll'];
const eventOptions = {
  capture: true,
  passive: false,
};

const EventListener = {
  handleEvent(e) {
    this[`on${e.type}`](e);
  },
};

const handler = Object.create(EventListener, {
  elementScrollPositions: {
    writeable: true,
    value: new WeakMap(),
  },
  onkeydown: {
    value(e) {
      if (!e.composedPath().includes(scrollableElement())) {
        e.preventDefault();
      }
    },
  },
  onmousedown: {
    value(e) {
      this.elementScrollPositions.set(e.target, {
        top: e.target.scrollTop,
        left: e.target.scrollLeft,
      });
    },
  },
  onscroll: {
    value(e) {
      if (!e.composedPath().includes(scrollableElement())) {
        e.preventDefault();
        const target =
          e.target === document ? document.documentElement : e.target;
        const initScroll = this.elementScrollPositions.get(target);
        if (initScroll) {
          target.scrollTo(initScroll.left, initScroll.top);
        }
      }
    },
  },
  onwheel: {
    value(e) {
      e.preventDefault();
      const nodePath = e.composedPath();
      const idx = nodePath.indexOf(scrollableElement());
      if (idx > -1) {
        const elems = nodePath.slice(0, idx + 1);
        if (elems.length) {
          let { pixelX, pixelY } = normalizeWheel(e);
          elems.forEach((elem) => {
            // Scroll any scrollable element that is either `allowScrollingElement` or within `allowScrollingElemnt`.
            // Ensure that the remaining wheel delta is updated by the scrollable amount as each element is scrolled.
            const top = elem.scrollTop;
            const left = elem.scrollLeft;
            elem.scrollBy(pixelX, pixelY);
            const diffTop = elem.scrollTop - top;
            const diffLeft = elem.scrollLeft - left;
            pixelY = pixelY - diffTop;
            pixelX = pixelX - diffLeft;
          });
        }
      }
    },
  },
});

export default {
  // Specified element where scrolling is allowed.
  // NOTE: This enables scrolling within this element, including on other children within this element.
  elements: new Set(),

  // Restrict scrolling to only elements within the `exception` element.
  run: function () {
    events.forEach((event) => {
      window.addEventListener(event, handler, eventOptions);
    });
  },

  // Allow scrolling on all elements once again.
  stop: function () {
    events.forEach((event) => {
      window.removeEventListener(event, handler, eventOptions);
    });
  },

  // Add an element that scrolling is allowed within.
  to: function (elem) {
    allowScrollingWithin.add(elem);
    this.run();
  },

  // Remove an element that scrolling is allowed within.
  delete: function (elem) {
    allowScrollingWithin.delete(elem);
    if (!allowScrollingWithin.size) this.stop();
  },
};
