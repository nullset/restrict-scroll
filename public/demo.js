import restrictScroll from '../src/index.js';

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    if (e.target.dataset.type) {
      restrictScroll.add(document.getElementById(e.target.dataset.type));
    } else {
      restrictScroll.clear();
    }
  }
});

window.restrictScroll = restrictScroll;
