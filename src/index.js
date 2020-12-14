import normalizeWheel from 'normalize-wheel';

let allowScrollingInside;

const events = ['wheel', 'mousedown', 'keydown', 'scroll'];
const eventOptions = {
  capture: true,
  passive: false,
};

// // Fixes a long-lived Chrome bug wherein a section can go hidden after an event.
// // https://stackoverflow.com/questions/8840580/force-dom-redraw-refresh-on-chrome-mac
// function repaint() {
//   allowScrollingInside.hidden = true;
//   queueMicrotask(() => {
//     allowScrollingInside.hidden = false;
//   });
// }

const EventListener = {
  handleEvent(e) {
    this[`on${e.type}`](e);
  },
};

const handler = Object.create(EventListener, {
  elements: {
    writeable: true,
    value: new WeakMap(),
  },
  onkeydown: {
    value(e) {
      if (!e.composedPath().includes(allowScrollingInside)) {
        e.preventDefault();
      }
    },
  },
  onmousedown: {
    value(e) {
      this.elements.set(e.target, {
        top: e.target.scrollTop,
        left: e.target.scrollLeft,
      });
    },
  },
  onscroll: {
    value(e) {
      if (!e.composedPath().includes(allowScrollingInside)) {
        e.preventDefault();
        const target =
          e.target === document ? document.documentElement : e.target;
        const initScroll = this.elements.get(target);
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
      const idx = nodePath.indexOf(allowScrollingInside);
      if (idx > -1) {
        const elems = nodePath.slice(0, idx + 1);
        if (elems.length) {
          let { pixelX, pixelY } = normalizeWheel(e);
          elems.forEach((elem) => {
            elem.scrollBy(pixelX, pixelY);
          });
        }
      }
    },
  },
});

function on() {
  events.forEach((event) => {
    window.addEventListener(event, handler, eventOptions);
  });
}

function off() {
  events.forEach((event) => {
    window.removeEventListener(event, handler, eventOptions);
  });
}

function clear() {
  Object.keys(allowScrollingInside).forEach((key) => {
    allowScrollingInside[key] = [];
  });
}

export default function restrictScroll(exception) {
  allowScrollingInside = exception;
  on();

  return {
    // prevent: function prevent(exceptions) {
    //   removeItemFromGroup(exceptions);
    // },
    // allow: function allow(exceptions) {
    //   groupItems(exceptions);
    // },
    clear,
    on,
    off,
  };
}
