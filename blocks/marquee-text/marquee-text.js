export default function decorate(block) {
  const track = document.createElement('div');
  track.className = 'marquee-track';

  // Move original children into track
  [...block.children].forEach((child) => {
    track.append(child);
  });

  // Clone content for seamless loop
  const clone = track.cloneNode(true);
  clone.classList.add('clone');

  const wrapper = document.createElement('div');
  wrapper.className = 'marquee-wrapper';

  wrapper.append(track, clone);
  block.textContent = '';
  block.append(wrapper);
}