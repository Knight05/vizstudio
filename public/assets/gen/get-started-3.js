
/* Real account creation - passwordless. Posts to the same-origin Better-Auth
   sign-up endpoint; the set-password email (sent server-side) is the user's
   real credential setup. No data-form attribute, so forms.js skips this form. */
(function () {
  var form = document.getElementById('signup-form');
  if (!form) return;
  var btn = form.querySelector('button[type="submit"]');
  var card = form.closest('.form-card');

  function isEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s); }
  function fieldOf(i) { return i.closest('.form-field'); }
  function showErr(i, msg) { var f = fieldOf(i); if (!f) return; f.classList.add('err'); var e = f.querySelector('.err'); if (e && msg) e.textContent = msg; }
  function clearErr(i) { var f = fieldOf(i); if (f) f.classList.remove('err'); }

  function randomPassword() {
    var a = new Uint8Array(24);
    crypto.getRandomValues(a);
    return Array.from(a, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    var name = form.elements['name'], email = form.elements['email'], company = form.elements['company'];
    var valid = true;
    [name, email, company].forEach(clearErr);
    if (!name.value.trim()) { showErr(name, 'Required.'); valid = false; }
    if (!email.value.trim()) { showErr(email, 'Required.'); valid = false; }
    else if (!isEmail(email.value.trim())) { showErr(email, 'Enter a valid email.'); valid = false; }
    if (!company.value.trim()) { showErr(company, 'Required.'); valid = false; }
    if (!valid) return;

    var orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      var res = await fetch('/api/auth/sign-up/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.value.trim(),
          email: email.value.trim(),
          password: randomPassword(),
          company: company.value.trim(),
          callbackURL: '/dashboard'
        })
      });
      if (!res.ok) {
        var data = {};
        try { data = await res.json(); } catch (e) {}
        var msg = (data && (data.message || (data.error && data.error.message))) || 'Could not create your account. Please try again.';
        if (/exist|taken|already/i.test(msg)) { msg = 'An account with this email already exists. Try logging in.'; }
        showErr(email, msg);
        btn.disabled = false;
        btn.textContent = orig;
        return;
      }
      // GA4 conversion event (no-op when gtag is unavailable or blocked).
      try { if (typeof window.gtag === 'function') window.gtag('event', 'sign_up', { method: 'email' }); } catch (e) {}
      var success = card.querySelector('.form-success');
      if (success) { form.style.display = 'none'; success.classList.add('on'); }
      else { window.location.href = '/dashboard'; }
    } catch (e) {
      showErr(email, 'Network error, please try again.');
      btn.disabled = false;
      btn.textContent = orig;
    }
  });
})();
