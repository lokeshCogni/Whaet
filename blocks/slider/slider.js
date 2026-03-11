function buildCard(row) {
  // Accept either: an <img>/<picture> + texts, or plain text with links
  const img = row.querySelector('img, picture');
  const texts = [...row.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a')].filter((n) => !n.querySelector('img'));

  const card = document.createElement('article');
  card.className = 'slider-card';

  if (img) {
    const media = document.createElement('div');
    media.className = 'card-media';
    // move the picture/img inside
    media.append(img.closest('picture') || img);
    card.append(media);
  }

  // Title overlay (first meaningful text)
  const titleText = (texts[0]?.textContent || '').trim();
  if (titleText) {
    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.textContent = titleText;
    card.append(overlay);
  }

  // Optional caption/secondary line (second text node)
  if (texts[1]) {
    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.textContent = texts[1].textContent.trim();
    card.append(meta);
  }

  // If there is a link in the row, make the whole card clickable
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

function scrollByStep(viewport, dir = 1) {
  const first = viewport.querySelector('.slider-card');
  if (!first) return;
  const gap = parseFloat(getComputedStyle(viewport).getPropertyValue('--gap')) || 24;
  const step = first.getBoundingClientRect().width + gap;
  viewport.scrollBy({ left: dir * step, behavior: 'smooth' });
}

export default function decorate(block) {
  block.classList.add('is-enhanced');

  // Wrap original rows into a viewport/track
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

  // Controls
  const prev = document.createElement('button');
  prev.className = 'slider-btn prev';
  prev.setAttribute('aria-label', 'Previous');
  prev.innerHTML = '<span class="chev"></span>';

  const next = document.createElement('button');
  next.className = 'slider-btn next';
  next.setAttribute('aria-label', 'Next');
  next.innerHTML = '<span class="chev"></span>';

  prev.addEventListener('click', () => scrollByStep(viewport, -1));
  next.addEventListener('click', () => scrollByStep(viewport, 1));

  // Keyboard support on viewport
  viewport.setAttribute('tabindex', '0');
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') scrollByStep(viewport, -1);
    if (e.key === 'ArrowRight') scrollByStep(viewport, 1);
  });

  // Map vertical wheel to horizontal scroll (nice on desktops)
  viewport.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      viewport.scrollBy({ left: e.deltaY, behavior: 'auto' });
    }
  }, { passive: true });

  // Append
  block.append(prev, viewport, next);

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    viewport.style.scrollBehavior = 'auto';
  }
}
