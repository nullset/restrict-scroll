const allowScrollingInside = {
  elements: [],
  selectors: [],
};

const events = ['scroll', 'wheel'];
const eventOptions = {
  capture: true,
  passive: false,
};

function groupItems(exceptions) {
  exceptions = Array.isArray(exceptions) ? exceptions : [exceptions];
  exceptions.forEach((exception) => {
    switch (typeof exception) {
      case 'string':
        allowScrollingInside['selectors'].push(exception.trim());
        break;
      default:
        if (exception.nodeType === 1)
          allowScrollingInside['elements'].push(exception);
        break;
    }
  });
}

function removeItemFromGroup(exceptions) {
  exceptions = Array.isArray(exceptions) ? exceptions : [exceptions];
  exceptions.forEach((exception) => {
    let key;
    let idx;
    switch (typeof exception) {
      case 'string':
        key = 'selectors';
        idx = allowScrollingInside[key].indexOf(exception.trim());
        break;
      default:
        if (item.nodeType === 1) {
          key = 'elements';
          idx = allowScrollingInside[key].indexOf(exception.trim());
        }
        break;
    }
    if (key && idx > -1) {
      allowScrollingInside[key].splice(idx, 1);
    }
  });
}

function handler(e) {
  console.log({ detail: e.detail });
  const selectorString = allowScrollingInside.selectors.join(',');

  const idx = e.composedPath().indexOf();

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

function on() {
  // events.forEach((event) => {
  //   window.addEventListener(event, handler, eventOptions);
  // });
  window.addEventListener('wheel', handler, eventOptions);
  window.addEventListener('scroll', (e) => e.preventDefault(), eventOptions);
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

export default function restrictScroll(exceptions) {
  if (exceptions) {
    groupItems(exceptions);
    on();
  }

  return {
    prevent: function prevent(exceptions) {
      removeItemFromGroup(exceptions);
    },
    allow: function allow(exceptions) {
      groupItems(exceptions);
    },
    clear,
    on,
    off,
  };
}
