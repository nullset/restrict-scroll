import normalizeWheel from 'normalize-wheel';

let allowScrollingInside;

const events = ['scroll', 'wheel'];
const eventOptions = {
  capture: true,
  passive: false,
};

// function groupItems(exceptions) {
//   exceptions = Array.isArray(exceptions) ? exceptions : [exceptions];
//   exceptions.forEach((exception) => {
//     switch (typeof exception) {
//       case 'string':
//         allowScrollingInside['selectors'].push(exception.trim());
//         break;
//       default:
//         if (exception.nodeType === 1)
//           allowScrollingInside['elements'].push(exception);
//         break;
//     }
//   });
// }

// function removeItemFromGroup(exceptions) {
//   exceptions = Array.isArray(exceptions) ? exceptions : [exceptions];
//   exceptions.forEach((exception) => {
//     let key;
//     let idx;
//     switch (typeof exception) {
//       case 'string':
//         key = 'selectors';
//         idx = allowScrollingInside[key].indexOf(exception.trim());
//         break;
//       default:
//         if (item.nodeType === 1) {
//           key = 'elements';
//           idx = allowScrollingInside[key].indexOf(exception.trim());
//         }
//         break;
//     }
//     if (key && idx > -1) {
//       allowScrollingInside[key].splice(idx, 1);
//     }
//   });
// }

function handler2(e) {
  const elems = e.composedPath();
  const idx = elems.indexOf(allowScrollingInside);
  if (idx > -1) {
    const parentElems = elems.slice(idx + 1);
    parentElems.forEach((elem) => {
      elem.addEventListener(
        'wheel',
        (e) => {
          if (parentElems.includes(e.currentTarget)) e.preventDefault();
        },
        {
          passive: false,
        },
      );
      // Object.defineProperty(elem, 'scrollTop', {
      //   set: function (value) {},
      //   configurable: true,
      // });
    });
  }

  return;
  // const normalized = normalizeWheel(e);
  // console.log(normalized);
  // return;
  // const selectorString = allowScrollingInside.selectors.join(',');

  // const idx = e.composedPath().indexOf();

  // TODO: What about scrolling in 2 dimensions?
  // node.scrollTop = node.scrollHeight - node.clientHeight - e.deltaY;
  const inPath = e.composedPath().some((node) => {
    if (allowScrollingInside.elements.includes(node)) {
      console.log({
        // scrollTop: node.scrollTop,
        // scrollHeight: node.scrollHeight,
        // clientHeight: node.clientHeight,
        deltaY: e.deltaY,
        wheelY: e.wheelDeltaY,
      });
      // debugger;

      const deltaY = e.deltaY || 0;
      if (deltaY) {
        if (node.scrollTop <= node.scrollHeight - node.clientHeight - deltaY) {
          return true;
        } else {
          return false;
        }
      }

      // if (
      //   e.deltaY &&
      //   node.scrollTop <= node.scrollHeight - node.clientHeight - e.deltaY
      // ) {
      //   return true;
      // } else {
      //   return false;
      // }
    }

    if (!selectorString.length) return false;
    return node.matches(selectorString);
    // return allowScrollingInside.elements.includes(node) || selectorString.length
    //   ? node.matches(selectorString)
    //   : false;
  });

  if (!inPath) {
    e.preventDefault();
  }
}

function wheelHandler(e) {
  e.preventDefault();
  const nodePath = e.composedPath();
  const idx = nodePath.indexOf(allowScrollingInside);
  if (idx > -1) {
    const elems = nodePath.slice(0, idx + 1);
    if (elems.length) {
      let { pixelX, pixelY } = normalizeWheel(e);
      elems.forEach((elem) => {
        // const initScrollTop = elem.scrollTop;
        // const initScrollLeft = elem.scrollLeft;
        elem.scrollBy(pixelX, pixelY);
        // const diffTop = elem.scrollTop - initScrollTop;
        // const diffLeft = elem.scrollLeft - initScrollLeft;
        // pixelY = pixelY - diffTop;
        // pixelX = pixelX - diffLeft;
      });
    }
  }
}

const EventListener = {
  handleEvent(e) {
    this[`on${e.type}`](e);
  },
};

const EL = Object.create(EventListener, {
  elements: {
    writeable: true,
    value: new WeakMap(),
  },
  onscroll: {
    value(e) {
      if (!e.composedPath().includes(allowScrollingInside)) {
        e.preventDefault();
        const target =
          e.target === document ? document.documentElement : e.target;
        const initScroll = this.elements.get(target);
        if (initScroll) {
          // Technically shouldn't have to make a microtask here, but Chrome can have a rendering glitch without it.
          queueMicrotask(() => {
            target.scrollTo(initScroll.left, initScroll.top);
          });
        }
      }
      // e.preventDefault();
      // const scrolledElem = this.elements.get(e.target);
      // if (scrolledElem) {
      //   e.target.scrollTo(scrolledElem.top, scrolledElem.left);
      // }
    },
  },
  onkeydown: {
    value(e) {
      this.elements.set(e.target, {
        top: e.target.scrollTop,
        left: e.target.scrollLeft,
      });
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

function scrollHandler(e) {
  debugger;
  if (!e.composedPath().includes(allowScrollingInside)) {
    e.preventDefault();
    e.stopPropagation();
  }
}

function on() {
  // events.forEach((event) => {
  //   window.addEventListener(event, handler, eventOptions);
  // });

  window.addEventListener('wheel', EL, eventOptions);
  window.addEventListener('mousedown', EL, { capture: true });
  window.addEventListener('keydown', EL, { capture: true });
  window.addEventListener('scroll', EL, { capture: true });

  // window.addEventListener('wheel', (e) => e.preventDefault(), eventOptions);
  // window.addEventListener('scroll', handler, eventOptions);
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
