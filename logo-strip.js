(function () {
  const IMG_WIDTH = 120;
  const IMG_HEIGHT = 32;
  const PX_PER_SEC = 90;

  const containers = document.querySelectorAll('[data-logo-strip]');
  if (!containers.length) return;

  const raw = window.LOGO_STRIP;
  if (!Array.isArray(raw) || !raw.length) {
    containers.forEach((el) => el.closest('.logo-strip-section')?.remove());
    return;
  }

  function normalize(entry) {
    if (typeof entry === 'string') {
      return { src: entry, name: 'Partner logo', href: '' };
    }
    return {
      src: entry.src || entry.url || '',
      name: entry.name || entry.alt || 'Partner logo',
      href: entry.href || entry.link || '',
    };
  }

  function createLogoItem(logo) {
    const img = document.createElement('img');
    img.src = logo.src;
    img.alt = logo.name;
    img.width = IMG_WIDTH;
    img.height = IMG_HEIGHT;
    img.loading = 'eager';
    img.decoding = 'async';
    img.className = 'logo-strip-img';

    const wrap = document.createElement(logo.href ? 'a' : 'span');
    wrap.className = 'logo-strip-item';
    if (logo.href) {
      wrap.href = logo.href;
      wrap.target = '_blank';
      wrap.rel = 'noopener noreferrer';
      wrap.setAttribute('aria-label', logo.name);
    }
    wrap.appendChild(img);
    return wrap;
  }

  const logos = raw.map(normalize).filter((logo) => logo.src);

  function waitForImages(root) {
    const imgs = root.querySelectorAll('img');
    if (!imgs.length) return Promise.resolve();

    return Promise.all(
      [...imgs].map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve();
            else {
              img.addEventListener('load', resolve, { once: true });
              img.addEventListener('error', resolve, { once: true });
            }
          })
      )
    );
  }

  function initMarquee(container, group) {
    const track = container.querySelector('.logo-strip-track');
    if (!track || !group) return;

    const distance = group.offsetWidth;
    if (!distance) return;

    track.style.setProperty('--marquee-distance', distance + 'px');
    track.style.setProperty('--marquee-duration', distance / PX_PER_SEC + 's');
    container.classList.add('is-ready');
  }

  containers.forEach((container) => {
    container.replaceChildren();

    const track = document.createElement('div');
    track.className = 'logo-strip-track';

    const groupA = document.createElement('div');
    groupA.className = 'logo-strip-group';
    const groupB = document.createElement('div');
    groupB.className = 'logo-strip-group';
    groupB.setAttribute('aria-hidden', 'true');

    logos.forEach((logo) => groupA.appendChild(createLogoItem(logo)));
    logos.forEach((logo) => groupB.appendChild(createLogoItem(logo)));

    track.appendChild(groupA);
    track.appendChild(groupB);
    container.appendChild(track);

    const setup = () => {
      requestAnimationFrame(() => initMarquee(container, groupA));
    };

    waitForImages(container).then(setup);

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(setup);
      ro.observe(groupA);
    } else {
      window.addEventListener('resize', setup);
    }
  });
})();
