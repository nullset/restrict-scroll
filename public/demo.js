import restrictScroll from '../src/index.js';

document.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') {
    if (e.target.dataset.type) {
      const section = document.getElementById(e.target.dataset.type);
      if (section) restrictScroll.add(section);
    } else {
      restrictScroll.clear();
    }
  }
});

window.restrictScroll = restrictScroll;
