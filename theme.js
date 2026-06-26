(function () {
  const KEY = 'site-theme';
  const root = document.documentElement;
  const toggles = document.querySelectorAll('[data-theme-toggle]');

  function applyTheme(theme) {
    const isLight = theme === 'light';
    root.setAttribute('data-theme', isLight ? 'light' : 'dark');
    root.style.colorScheme = isLight ? 'light' : 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = isLight ? '#f7f9fb' : '#0b0d10';
    toggles.forEach((btn) => {
      btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
      btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    });
    try { localStorage.setItem(KEY, isLight ? 'light' : 'dark'); } catch (_) {}
  }

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      applyTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
    });
  });

  let saved = 'dark';
  try { saved = localStorage.getItem(KEY) || 'dark'; } catch (_) {}
  if (saved === 'light') applyTheme('light');
})();
