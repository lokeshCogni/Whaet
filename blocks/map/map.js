
export default function decorate(block) {
  const address = block.textContent.trim();
  block.innerHTML = `
    <iframe
      src="https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed"
      loading="lazy"
      allowfullscreen
      referrerpolicy="no-referrer-when-downgrade">
    </iframe>
  `;
}
