// =========================================================
// LU COSTUME — Pre-Sale form logic
// =========================================================
(function () {
  'use strict';
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('presaleForm');
    if (!form) return;
    const successEl = document.getElementById('presaleSuccess');
    const errorEl = document.getElementById('presaleError');
    const submitBtn = document.getElementById('presaleSubmit');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      successEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Šaljem...';

      const fd = new FormData(form);
      const payload = { name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), size: fd.get('size'), note: fd.get('note') };

      try {
        const res = await fetch('/api/presale', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Greška pri registraciji.');
        successEl.hidden = false;
        form.reset();
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.hidden = false;
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Prijavite se za Pre-Sale';
      }
    });
  });
})();
