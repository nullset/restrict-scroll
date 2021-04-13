import normalizeWheel from 'normalize-wheel';

let list = new Set();
const scrollChildrenMap = new WeakMap();

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
      if (!restrictScroll.list.size) return;
      if (!e.composedPath().includes(activeElement())) {
        e.preventDefault();
      }
    },
  },
  onmousedown: {
    value(e) {
      if (!restrictScroll.list.size) return;
      this.elementScrollPositions.set(e.target, {
        top: e.target.scrollTop,
        left: e.target.scrollLeft,
      });
    },
  },
  onscroll: {
    value(e) {
      if (!restrictScroll.list.size) return;
      e.preventDefault();
      if (!e.composedPath().includes(activeElement())) {
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
      if (!restrictScroll.list.size) return;
      e.preventDefault();
      let { pixelX, pixelY } = normalizeWheel(e);
      const nodePath = e.composedPath();
      const activeElem = activeElement();
      const scrollChildren = scrollChildrenMap.get(activeElem);

      if (!scrollChildren) {
        activeElem.scrollBy(pixelX, pixelY);
      } else {
        const idx = nodePath.indexOf(activeElem);
        if (idx > -1) {
          const elems = nodePath.slice(0, idx + 1);
          if (elems.length) {
            elems.forEach((elem) => {
              // Only scroll on element nodes, not document/document-fragments. Ensures it works with shadowDOM.
              if (elem.nodeType !== Node.ELEMENT_NODE) return;

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
      }
    },
  },
});

const restrictScroll = {
  // Specified element where scrolling is allowed.
  // NOTE: This enables scrolling within this element, including on other children within this element.
  get list() {
    return list;
  },

  get isWatching() {
    return !!list.size;
  },

  get activeElement() {
    return activeElement();
  },

  // Restrict scrolling to only the `activeElement` element.
  run: function () {
    events.forEach((event) => {
      window.addEventListener(event, handler, eventOptions);
    });
  },

  // Allow scrolling on all elements once again.
  // Typically used to temporarily allow scrolling on all elements.
  pause: function () {
    events.forEach((event) => {
      window.removeEventListener(event, handler, eventOptions);
    });
  },

  // Add an element within which scrolling is allowed.
  // NOTE: Only one element can be scrollable at a time. Any existing element within `list`
  // becomes unscrollable unless that element is a child of the `activeElement` element (most recently specified element).
  add: function (elem, options = {}) {
    // If `scrollChildren` is undefined, then assume we want to scroll on any scrollable children inside this element.
    options.scrollChildren =
      options.scrollChildren == null ? true : options.scrollChildren;

    // If element already exists in the list, delete the list's reference to it, and add the elment to the end of the list.
    if (list.has(elem)) list.delete(elem);
    list.add(elem);
    scrollChildrenMap.set(elem, options.scrollChildren);
    this.run();
  },

  // Remove a scrollable element. Specified element will now be unscrollable unless this a child of another scrollable element.
  delete: function (elem) {
    list.delete(elem);
    if (!list.size) this.pause();
  },

  // Clears all elements from the list of scrollable elements. Every element becomes scrollable again.
  clear: function () {
    list.clear();
  },
};

export default restrictScroll;
