import restrictScroll from '../src/index.js';

const section = document.getElementById('section');

const scroller = restrictScroll(section);

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    scroller.set(document.getElementById(e.target.dataset.type));
  }
});
