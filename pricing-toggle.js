(function () {
  const KEY = 'pricing-currency';
  const PRICES = {
    usd: ['$500', '$800/mo'],
    pkr: ['50,000 PKR', '80,000 PKR/mo'],
  };

  const els = document.querySelectorAll('[data-pricing]');
  const toggles = document.querySelectorAll('[data-currency-toggle]');
  if (!els.length) return;

  function render(el, mode) {
    const contactHref = el.getAttribute('data-contact-href') || '#contact';
    const [project, retainer] = PRICES[mode];
    el.innerHTML =
      'Projects from <strong>' + project + '</strong> · Retainers from <strong>' + retainer +
      '</strong> · <a href="' + contactHref + '">Available for freelance</a>';
  }

  function setCurrency(currency) {
    const mode = currency === 'pkr' ? 'pkr' : 'usd';
    els.forEach((el) => render(el, mode));
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', mode === 'pkr' ? 'true' : 'false');
      btn.textContent = mode === 'pkr' ? 'Switch to USD $' : 'Switch to PKR 🇵🇰';
    });
    try { localStorage.setItem(KEY, mode); } catch (_) {}
  }

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      setCurrency(btn.getAttribute('aria-pressed') === 'true' ? 'usd' : 'pkr');
    });
  });

  let saved = 'usd';
  try { saved = localStorage.getItem(KEY) || 'usd'; } catch (_) {}
  setCurrency(saved);
})();
