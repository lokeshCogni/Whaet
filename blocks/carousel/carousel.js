import { fetchPlaceholders } from '../../scripts/placeholders.js';

function updateActiveSlide(slide) {
  const block = slide.closest('.carousel');
  const slideIndex = parseInt(slide.dataset.slideIndex, 10);
  block.dataset.activeSlide = slideIndex;

  const slides = block.querySelectorAll('.carousel-slide');

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  // If indicators ever exist again, keep this defensive update.
  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  if (indicators && indicators.length) {
    indicators.forEach((indicator, idx) => {
      const button = indicator.querySelector('button');
      if (idx !== slideIndex) {
        button?.removeAttribute('disabled');
        button?.removeAttribute('aria-current');
      } else {
        button?.setAttribute('disabled', true);
        button?.setAttribute('aria-current', true);
      }
    });
  }
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;

  const activeSlide = slides[realSlideIndex];
  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));

  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetLeft,
    behavior: 'smooth',
  });
}

function bindEvents(block) {
  // Always wire arrows, even without indicators.
  const prevBtn = block.querySelector('.slide-prev');
  const nextBtn = block.querySelector('.slide-next');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
    });
  }

  // Only wire indicator clicks if they exist (future‑proof).
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (slideIndicators) {
    slideIndicators.querySelectorAll('button').forEach((button) => {
      button.addEventListener('click', (e) => {
        const slideIndicator = e.currentTarget.parentElement;
        showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
      });
    });
  }

  // Keep IntersectionObserver to update active slide index for arrows/scrolling.
  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) updateActiveSlide(entry.target);
    });
  }, { threshold: 0.5 });

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy && !labeledBy.getAttribute('id')) {
    // Ensure the heading has an id so aria-labelledby resolves.
    labeledBy.setAttribute('id', `carousel-${carouselId}-heading-${slideIndex}`);
  }
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.classList.add('carousel');
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');

  // We’ll _not_ create indicators anymore.
  // let slideIndicators = null;

  // Navigation arrows only (no dots)
  if (!isSingleSlide) {
    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;
    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    // Indicators intentionally disabled:
    // if (slideIndicators) { ... }

    row.remove();
  });

  container.append(slidesWrapper);
  block.textContent = '';
  block.append(container);

  if (!isSingleSlide) {
    bindEvents(block);
  }

  // Initialize active slide to the first one.
  block.dataset.activeSlide = 0;
}
