// =========================================================
// LU COSTUME — Contact form logic
// =========================================================
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const errorEl = document.getElementById('contactError');
    const successEl = document.getElementById('contactSuccess');
    const submitBtn = document.getElementById('contactSubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      successEl.hidden = true;

      const fd = new FormData(form);
      const payload = {
        name: fd.get('name'),
        email: fd.get('email'),
        phone: fd.get('phone'),
        message: fd.get('message'),
      };

      submitBtn.disabled = true;
      submitBtn.textContent = 'Šaljem...';

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Greška pri slanju poruke.');

        successEl.hidden = false;
        form.reset();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pošalji poruku';
      }
    });
  });
})();
