(() => {
  // Mobile menu toggle
  const navToggle = document.querySelector('.navbar__toggle');
  const navLinks = document.querySelector('.navbar__links-container');
  const heroNav = document.querySelector('.hero__nav');

  const setMenuState = (expanded) => {
    if (!navToggle) return;

    navToggle.setAttribute('aria-expanded', String(expanded));
    document.body.style.overflow = expanded ? 'hidden' : '';
  };
  
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
      setMenuState(!isExpanded);
    });

    // Close menu when clicking on a link
    const links = navLinks.querySelectorAll('.navbar__link');
    links.forEach(link => {
      link.addEventListener('click', () => {
        setMenuState(false);
      });
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
        setMenuState(false);
      }
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (
        navToggle.getAttribute('aria-expanded') === 'true' &&
        !navLinks.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        setMenuState(false);
      }
    });
  }

  // Navbar hide/show on scroll
  if (!heroNav) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateNavVisibility = () => {
    const currentY = window.scrollY;
    const isScrollingDown = currentY > lastScrollY;
    const isBeyondHero = currentY > 80;

    if (isScrollingDown && isBeyondHero) {
      heroNav.classList.add('hero__nav--hidden');
    } else {
      heroNav.classList.remove('hero__nav--hidden');
    }

    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavVisibility);
        ticking = true;
      }
    },
    { passive: true }
  );

  // Ensure page is bfcache-friendly
  // This helps the browser cache the page for instant back/forward navigation
  window.addEventListener('pageshow', (event) => {
    // Restore scroll position if page was loaded from bfcache
    if (event.persisted) {
      // Page was restored from bfcache, reinitialize if needed
      lastScrollY = window.scrollY;
    }
  });
})();

