(function () {
  const track = document.getElementById('compile-track');
  const hero = document.getElementById('hero-site');
  if (!track || !hero) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobileMq = window.matchMedia('(max-width: 768px)');

  let scrolledToHero = false;
  let scrollTween = null;

  function isMobile() {
    return mobileMq.matches;
  }

  function skipCompile() {
    track.classList.add('compile-skipped');
    document.body.classList.add('compile-skipped');
  }

  function heroScrollTarget() {
    const nav = 88;
    return Math.max(0, hero.offsetTop - nav);
  }

  function slowScrollToHero(gsap) {
    if (isMobile() || scrolledToHero || scrollTween) return;
    scrolledToHero = true;
    document.body.classList.add('compile-handoff');

    scrollTween = gsap.to(window, {
      scrollTo: { y: heroScrollTarget(), autoKill: false },
      duration: 1.35,
      ease: 'power1.inOut',
      onComplete: () => {
        scrollTween = null;
        document.body.classList.remove('compile-handoff');
        document.body.classList.add('compile-done');
      },
    });
  }

  function syncCompileUI(progress) {
    const status = document.getElementById('compile-status');
    const title = document.querySelector('.preview-title');
    const btns = document.querySelector('.preview-btns');
    const pills = document.querySelector('.preview-pills');

    title?.classList.toggle('is-live', progress >= 0.7);
    btns?.classList.toggle('is-live', progress >= 0.74);
    pills?.classList.toggle('is-live', progress >= 0.78);

    if (status) {
      status.textContent = progress >= 0.76 ? '✓ compiled' : '';
    }
  }

  if (reduced) {
    skipCompile();
    return;
  }

  document.body.classList.add('compile-active');

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  Promise.all([
    loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js'),
    loadScript('https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollToPlugin.min.js'),
  ])
    .then(() => {
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);

      const hint = document.getElementById('compile-hint');
      const previewPanel = document.querySelector('.compile-preview');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: 'top top',
          end: 'bottom bottom',
          scrub: isMobile() ? 0.25 : 0.5,
          invalidateOnRefresh: true,
          onLeave(self) {
            if (self.direction === 1) slowScrollToHero(gsap);
          },
          onEnterBack() {
            if (scrollTween) {
              scrollTween.kill();
              scrollTween = null;
            }
            scrolledToHero = false;
            document.body.classList.remove('compile-handoff', 'compile-done');
          },
          onUpdate(self) {
            syncCompileUI(self.progress);
            if (self.progress >= 0.8 && self.direction === 1) {
              slowScrollToHero(gsap);
            }
          },
        },
      });

      const lines = gsap.utils.toArray('#compile-track .code-line');
      const tLines = gsap.utils.toArray('#compile-track .compile-terminal .t-line');

      const LINE_STEP = isMobile() ? 0.05 : 0.042;

      lines.forEach((line, i) => {
        tl.fromTo(
          line,
          { filter: 'grayscale(1) brightness(0.55)' },
          { filter: 'grayscale(0) brightness(1)', duration: 0.035, ease: 'none' },
          i * LINE_STEP
        );
      });

      tLines.forEach((line, i) => {
        gsap.set(line, { opacity: 0.3 });
        tl.to(line, { opacity: 1, duration: 0.02, ease: 'none' }, 0.52 + i * 0.055);
      });

      tl.to(hint, { opacity: 0, duration: 0.1 }, 0.08);

      if (!isMobile() && previewPanel) {
        tl.fromTo(previewPanel, { opacity: 0 }, { opacity: 1, duration: 0.18, ease: 'none' }, 0.58)
          .to('#compile-track .compile-sticky', { y: -24, duration: 0.15, ease: 'none' }, 0.76);
      } else {
        tl.to('#compile-track .compile-sticky', { y: -12, duration: 0.12, ease: 'none' }, 0.76);
      }

      window.addEventListener('resize', () => ScrollTrigger.refresh());
    })
    .catch(skipCompile);
})();
