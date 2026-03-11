export default function decorate(block) {
  [...block.children].forEach((row) => {
    const label = row.children[0]?.textContent.trim() || '';
    const percent = row.children[1]?.textContent.replace('%', '').trim() || '0';

    row.innerHTML = `
      <div class="progress-item">
        <div class="progress-top">
          <span class="progress-label">${label}</span>
          <span class="progress-value">${percent}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${percent}%"></div>
        </div>
      </div>
    `;
  });
}
