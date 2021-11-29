import restrictScroll from '../src/index.js';

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    document
      .querySelectorAll('button')
      .forEach((node) => delete node.dataset.active);

    if (e.target.dataset.type) {
      const section = document.getElementById(e.target.dataset.type);
      if (section) {
        restrictScroll.add(section);
        e.target.dataset.active = '';
      }
    } else {
      restrictScroll.clear();
    }
  }
});

window.restrictScroll = restrictScroll;
