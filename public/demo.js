import restrictScroll from '../src/index.js';

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    restrictScroll.add(document.getElementById(e.target.dataset.type));
  }
});

window.restrictScroll = restrictScroll;
