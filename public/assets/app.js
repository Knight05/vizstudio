// vizstudio.io — gallery search + category filter
(function () {
  const input = document.getElementById('q');
  const stats = document.getElementById('search-stats');
  const chips = document.querySelectorAll('.chip[data-cat]');
  const cards = document.querySelectorAll('.card[data-name]');
  const blocks = document.querySelectorAll('.cat-block');
  const totalEl = document.getElementById('total-count');
  let activeCat = 'all';
  let activeQ = '';

  function apply() {
    const q = activeQ.trim().toLowerCase();
    let visible = 0;
    cards.forEach((c) => {
      const name = (c.dataset.name || '').toLowerCase();
      const desc = (c.dataset.desc || '').toLowerCase();
      const cat = c.dataset.cat || '';
      const matchQ = !q || name.includes(q) || desc.includes(q);
      const matchCat = activeCat === 'all' || cat === activeCat;
      const show = matchQ && matchCat;
      c.classList.toggle('hidden', !show);
      if (show) visible++;
    });
    // Hide empty category blocks
    blocks.forEach((b) => {
      const anyVisible = b.querySelectorAll('.card:not(.hidden)').length > 0;
      b.classList.toggle('hidden', !anyVisible);
    });
    if (stats) stats.textContent = `${visible} / ${cards.length} charts`;
  }

  if (input) {
    input.addEventListener('input', (e) => {
      activeQ = e.target.value;
      apply();
    });
  }
  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeCat = chip.dataset.cat;
      apply();
    });
  });

  if (totalEl) totalEl.textContent = cards.length;
  apply();
})();
