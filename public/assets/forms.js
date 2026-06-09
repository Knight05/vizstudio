(function () {
// vizstudio forms — shared submit handler
//
// Each <form data-form="<name>"> is intercepted and POSTed to FORM_ENDPOINT.
// Replace FORM_ENDPOINT with your real form-handler URL (Formspree, Web3Forms,
// Netlify Forms, or your own backend). Until you do, the form just shows a
// local success state.
const FORM_ENDPOINT = '/api/forms'; // vizstudio backend — stores submissions for the admin panel
const CONTACT_EMAIL = 'brandonlea05@gmail.com'; // mailto fallback until FORM_ENDPOINT is set

const FREE_MAIL = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
  'aol.com', 'protonmail.com', 'proton.me', 'mail.com', 'live.com',
  'msn.com', 'ymail.com', 'gmx.com', 'inbox.com', 'fastmail.com',
  'me.com', 'mac.com', 'rocketmail.com', 'duck.com', 'pm.me'
]);

// TESTING: set to true to allow personal/free email domains (gmail, etc.)
// through the signup form. Flip back to false to re-enable the business-email gate.
const ALLOW_FREE_EMAIL = true;

function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
function isBusinessEmail(s) {
  if (!isEmail(s)) return false;
  if (ALLOW_FREE_EMAIL) return true;
  const dom = s.split('@').pop().toLowerCase();
  return !FREE_MAIL.has(dom);
}

function showField(field, msg) {
  field.classList.add('err');
  const e = field.querySelector('.err');
  if (e && msg) e.textContent = msg;
}
function clearField(field) {
  field.classList.remove('err');
}

async function submitForm(form, data) {
  if (FORM_ENDPOINT) {
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.ok;
    } catch (e) { return false; }
  }
  // No endpoint configured — open a prefilled email draft so submissions
  // still reach a human, then show the success state.
  if (CONTACT_EMAIL) {
    const subject = encodeURIComponent('[vizstudio] ' + (data.form || 'form') + ' submission');
    const body = encodeURIComponent(Object.entries(data).map(([k, v]) => k + ': ' + v).join('\n'));
    window.location.href = 'mailto:' + CONTACT_EMAIL + '?subject=' + subject + '&body=' + body;
  }
  await new Promise((r) => setTimeout(r, 350));
  return true;
}

// ── Wire up data-form="signup" / "suggest" / "subscribe" ────────────────
document.querySelectorAll('form[data-form]').forEach((form) => {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const kind = form.dataset.form;
    const fields = form.querySelectorAll('.form-field');
    let valid = true;
    const data = { form: kind };

    fields.forEach((f) => {
      const input = f.querySelector('input, textarea, select');
      if (!input) return;
      clearField(f);
      const v = (input.value || '').trim();
      const required = input.hasAttribute('required');
      if (required && !v) {
        showField(f, 'Required.');
        valid = false;
      } else if (input.type === 'email' && v && !isEmail(v)) {
        showField(f, 'Enter a valid email.');
        valid = false;
      } else if (input.dataset.business === '1' && v && !isBusinessEmail(v)) {
        showField(f, 'Please use a business email.');
        valid = false;
      }
      data[input.name] = v;
    });

    // Honeypot — humans never see/fill this; bots usually do.
    const hp = form.querySelector('input[name="website"]');
    if (hp) data.website = (hp.value || '').trim();

    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';

    const ok = await submitForm(form, data);
    btn.disabled = false;
    btn.textContent = orig;

    if (ok) {
      const success = form.parentElement.querySelector('.form-success');
      if (success) {
        form.style.display = 'none';
        success.classList.add('on');
      } else {
        btn.textContent = '✓ thanks';
        btn.classList.add('done');
        btn.disabled = true;
      }
    } else {
      btn.textContent = 'Try again';
    }
  });
});

// ── Inline .subscribe-form (used in CTA bands) ──────────────────────────
document.querySelectorAll('.subscribe-form').forEach((form) => {
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const msg = form.parentElement.querySelector('.subscribe-msg');
    const btn = form.querySelector('button');
    const v = (input.value || '').trim();
    if (!isEmail(v)) {
      if (msg) msg.textContent = 'Enter a valid email.';
      return;
    }
    btn.textContent = 'Sending…';
    btn.disabled = true;
    const hp = form.querySelector('input[name="website"]');
    const ok = await submitForm(form, { form: 'subscribe', email: v, website: hp ? (hp.value || '').trim() : '' });
    if (ok) {
      btn.textContent = '✓ Subscribed';
      btn.classList.add('done');
      if (msg) msg.textContent = "You're in. Look for our next update soon.";
      input.value = '';
    } else {
      btn.textContent = 'Try again';
      btn.disabled = false;
    }
  });
});
})();
