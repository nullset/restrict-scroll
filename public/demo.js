import restrictScroll from '../src/index.js';

const section = document.getElementById('section');

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    restrictScroll.to(document.getElementById(e.target.dataset.type));
  }
});

window.restrictScroll = restrictScroll;
