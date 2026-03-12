// blocks/contact-form/contact-form.js
// Lightweight contact form for EDS – posts JSON to a configurable endpoint.
// Add data-endpoint="https://your-endpoint" to the block wrapper to set target.

function isEmpty(v) {
  return !v || !String(v).trim();
}

export default function decorate(block) {
  // read endpoint from data-endpoint (recommended), else default path
  const endpoint = block.dataset.endpoint || '/api/contact';

  // optional: theme class via block option e.g., (olive)
  const theme = [...block.classList].find((c) => c.startsWith('theme-'));

  block.innerHTML = `
    <form class="cf-form" novalidate>
      <!-- honeypot (spam trap) -->
      <input type="text" name="website" class="hp" tabindex="-1" autocomplete="off" />

      <h3 class="cf-heading">Send A Message</h3>

      <div class="cf-row">
        <label>
          <span class="visually-hidden">Name</span>
          <input name="name" type="text" placeholder="Name..." required />
        </label>
        <label>
          <span class="visually-hidden">Email</span>
          <input name="email" type="email" placeholder="Email..." required />
        </label>
      </div>

      <div class="cf-row">
        <label>
          <span class="visually-hidden">Phone</span>
          <input name="phone" type="tel" placeholder="Phone..." />
        </label>
        <label>
          <span class="visually-hidden">Subject</span>
          <input name="subject" type="text" placeholder="Subject..." />
        </label>
      </div>

      <label class="cf-textarea">
        <span class="visually-hidden">Text Message</span>
        <textarea name="message" rows="6" placeholder="Text Message..." required></textarea>
      </label>

      <div class="cf-actions">
        <button type="submit" class="cf-submit">SEND A MESSAGE</button>
        <p class="cf-status" aria-live="polite"></p>
      </div>
    </form>
  `;

  if (theme) block.classList.add(theme);

  const form = block.querySelector('form');
  const status = block.querySelector('.cf-status');
  const submitBtn = block.querySelector('.cf-submit');

  function setBusy(b) {
    submitBtn.disabled = b;
    submitBtn.textContent = b ? 'Sending…' : 'SEND A MESSAGE';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.textContent = '';

    // honeypot
    if (!isEmpty(form.website?.value)) {
      status.textContent = 'Something went wrong. Please try again.';
      return;
    }

    // simple client-side validation
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());

    if (isEmpty(data.name) || isEmpty(data.email) || isEmpty(data.message)) {
      status.textContent = 'Please fill the required fields.';
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // include page info for context
        body: JSON.stringify({
          ...data,
          _page: window.location.href,
          _ts: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      form.reset();
      status.textContent = 'Thanks! Your message has been sent.';
    } catch (err) {
      status.textContent = 'Sorry, something went wrong. Please try again.';
    } finally {
      setBusy(false);
    }
  });
}