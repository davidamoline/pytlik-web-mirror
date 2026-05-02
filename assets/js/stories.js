// Category filter for success stories archive
(() => {
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('[data-categories]');
  if (!buttons.length || !cards.length) return;

  // Map broad filter keys to category keywords
  const filterMap = {
    'implants': ['implant', 'dental implant', 'interdisciplinary'],
    'gum': ['gum', 'periodontal', 'esthetic', 'cosmetic', 'root coverage', 'tissue', 'recession', 'papilla'],
    'boneloss': ['boneloss', 'bone grafting', 'bone loss', 'ridge']
  };

  function matchesFilter(categories, filter) {
    if (filter === 'all') return true;
    const keywords = filterMap[filter] || [filter];
    const cats = categories.toLowerCase();
    return keywords.some((kw) => cats.includes(kw));
  }

  function filterBy(filter) {
    // Update active button in top tabs
    buttons.forEach((b) => b.classList.remove('is-active'));
    const matchingBtn = Array.from(buttons).find(
      (b) => b.dataset.filter === filter
    );
    if (matchingBtn) matchingBtn.classList.add('is-active');

    // Filter cards
    cards.forEach((card) => {
      if (matchesFilter(card.dataset.categories, filter)) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  // Top filter tabs
  buttons.forEach((btn) => {
    btn.addEventListener('click', () => filterBy(btn.dataset.filter));
  });

  // Chip tags inside cards — stop the card link navigation and filter instead
  document.querySelectorAll('[data-chip-filter]').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Find the best matching broad filter for this chip
      const chipCat = chip.dataset.chipFilter.toLowerCase();
      let bestFilter = 'all';
      for (const [key, keywords] of Object.entries(filterMap)) {
        if (keywords.some((kw) => chipCat.includes(kw))) {
          bestFilter = key;
          break;
        }
      }
      filterBy(bestFilter);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();
