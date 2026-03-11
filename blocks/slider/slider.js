// blocks/slider/slider.js
// Horizontal card slider for EDS with loop + autoplay + keyboard support

function buildCard(row) {
  const img = row.querySelector('img, picture');
  const texts = [...row.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a')].filter((n) => !n.querySelector('img'));

  const card = document.createElement('article');
  card.className = 'slider-card';

  if (img) {
    const media = document.createElement('div');
    media.className = 'card-media';
    media.append(img.closest('picture') || img);
    card.append(media);
  }

  const titleText = (texts[0]?.textContent || '').trim();
  if (titleText) {
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.textContent = titleText;
    card.append(overlay);
  }

  if (texts[1]) {
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = texts[1].textContent.trim();
    card.append(meta);
  }

  const firstLink = row.querySelector('a[href]');
  if (firstLink) {
    const link = document.createElement('a');
    link.className = 'card-link';
    link.href = firstLink.href;
    link.setAttribute('aria-label', `Open: ${titleText || 'item'}`);
    card.append(link);
  }

  return card;
}

function getStep(viewport) {
  const first = viewport.querySelector('.slider-card');
  if (!first) return 0;
  const gap = parseFloat(getComputedStyle(viewport).getPropertyValue('--gap')) || 24;
  return first.getBoundingClientRect().width + gap;
}

function loopScroll(viewport, dir) {
  const step = getStep(viewport);
  if (!step) return;

  const max = viewport.scrollWidth - viewport.clientWidth;

  // Wrap forward (last → first)
  if (dir > 0 && viewport.scrollLeft >= max - step / 2) {
    viewport.scrollLeft = 0;
    requestAnimationFrame(() => {
      viewport.scrollBy({ left: step, behavior: 'smooth' });
    });
    return;
  }

  // Wrap backward (first → last)
  if (dir < 0 && viewport.scrollLeft <= step / 2) {
    viewport.scrollLeft = max;
    requestAnimationFrame(() => {
      viewport.scrollBy({ left: -step, behavior: 'smooth' });
    });
    return;
  }

  // Normal step
  viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
}

export default function decorate(block) {
  block.classList.add('is-enhanced');

  const rows = [...block.children];
  const viewport = document.createElement('div');
  viewport.className = 'slider-viewport';
  const track = document.createElement('div');
  track.className = 'slider-track';
  viewport.append(track);

  rows.forEach((row) => {
    const card = buildCard(row);
    if (card) track.append(card);
    row.remove();
  });

  const prev = document.createElement('button');
  prev.className = 'slider-btn prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '<span class="chev"></span>';

  const next = document.createElement('button');
  next.className = 'slider-btn next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '<span class="chev"></span>';

  prev.addEventListener('click', () => loopScroll(viewport, -1));
  next.addEventListener('click', () => loopScroll(viewport, 1));

  // Keyboard
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') loopScroll(viewport, -1);
    if (e.key === 'ArrowRight') loopScroll(viewport, 1);
  });

  // Map vertical wheel to horizontal movement
  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      viewport.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: true });

  block.append(prev, viewport, next);

  // Autoplay (pause on hover/focus)
  const AUTOPLAY_MS = 3000;
  let timer = setInterval(() => loopScroll(viewport, 1), AUTOPLAY_MS);
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => {
    if (!timer) {
      timer = setInterval(() => loopScroll(viewport, 1), AUTOPLAY_MS);
    }
  };

  block.addEventListener('mouseenter', stop);
  block.addEventListener('mouseleave', start);
  block.addEventListener('focusin', stop);
  block.addEventListener('focusout', start);

  // Respect reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stop();
    viewport.style.scrollBehavior = 'auto';
  }
}
