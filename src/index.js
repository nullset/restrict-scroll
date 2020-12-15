import normalizeWheel from 'normalize-wheel';

let list = new Set();

function activeElement() {
  const arr = Array.from(list);
  for (let i = arr.length - 1; i >= 0; i--) {
    const node = arr[i];
    if (node && node.isConnected) {
      return node;
    } else {
      arr.splice(i, 1);
      list.delete(node);
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
      if (!e.composedPath().includes(target())) {
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
      if (!e.composedPath().includes(target())) {
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
      const idx = nodePath.indexOf(target());
      if (idx > -1) {
        const elems = nodePath.slice(0, idx + 1);
        if (elems.length) {
          let { pixelX, pixelY } = normalizeWheel(e);
          elems.forEach((elem) => {
            // Scroll any scrollable element that is either in the `list` list or a child of an element within `list`.
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
  get list() {
    return list;
  },

  get activeElement() {
    return activeElement();
  },

  // Restrict scrolling to only the `target()` element.
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

  // Add an element within which scrolling is allowed.
  // NOTE: Only one element can be scrollable at a time. Any existing element within `list`
  // becomes unscrollable unless that element is a child of the `target()` element (most recently specified element).
  to: function (elem) {
    // If element already exists in the list, delete the list's reference to it, and add the elment to the end of the list.
    if (list.has(elem)) list.delete(elem);
    list.add(elem);
    this.run();
  },

  // Remove a scrollable element. Specified element will now be unscrollable unless this a child of another scrollable element.
  delete: function (elem) {
    list.delete(elem);
    if (!list.size) this.stop();
  },

  // Clears all elements from the list of scrollable elements. Every element becomes scrollable again.
  clear: function () {
    list.clear();
  },
};
