/* ==========================================================================
   MERIDIAN — Creative Agency
   Script
   ========================================================================== */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  const hasLenis = typeof window.Lenis !== 'undefined';

  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ------------------------------------------------------------------ */
  /* Smooth scrolling (Lenis)                                           */
  /* ------------------------------------------------------------------ */
  let lenis = null;

  function initSmoothScroll() {
    if (prefersReducedMotion || !hasLenis) return;

    lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.1,
    });

    lenis.on('scroll', () => {
      if (hasGSAP && window.ScrollTrigger) ScrollTrigger.update();
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  /* ------------------------------------------------------------------ */
  /* Smooth in-page anchor scrolling                                    */
  /* ------------------------------------------------------------------ */
  function initAnchorLinks() {
    document.querySelectorAll('a[href*="#"]').forEach((link) => {
      const url = new URL(link.href, window.location.href);
      const samePage = url.pathname === window.location.pathname || url.pathname.endsWith('/index.html');
      if (!url.hash) return;

      link.addEventListener('click', (e) => {
        const target = document.querySelector(url.hash);
        if (!target) return;
        if (!samePage) return; // let the browser navigate then land on hash
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -20, duration: 1.2 });
        } else {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navigation: scroll state + mobile menu                             */
  /* ------------------------------------------------------------------ */
  function initNav() {
    const nav = document.querySelector('[data-nav]');
    const toggle = document.querySelector('[data-nav-toggle]');
    const mobileMenu = document.querySelector('[data-mobile-menu]');

    if (nav) {
      const setScrolled = () => {
        if (window.scrollY > 24) nav.classList.add('is-scrolled');
        else nav.classList.remove('is-scrolled');
      };
      setScrolled();
      window.addEventListener('scroll', setScrolled, { passive: true });
    }

    if (toggle && mobileMenu) {
      toggle.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
        if (lenis) {
          isOpen ? lenis.stop() : lenis.start();
        }
      });

      mobileMenu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
          if (lenis) lenis.start();
        });
      });
    }
  }

  /* ------------------------------------------------------------------ */
  /* Hero headline split-line reveal (one orchestrated load moment)     */
  /* ------------------------------------------------------------------ */
  function initHeroReveal() {
    const lines = document.querySelectorAll('[data-split-lines] .line span');
    const heroBits = document.querySelectorAll('.hero__eyebrow, .hero__sub, .hero__actions');

    if (prefersReducedMotion || !hasGSAP) {
      lines.forEach((el) => (el.style.transform = 'none'));
      heroBits.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.to(lines, {
      y: '0%',
      duration: 1.1,
      stagger: 0.09,
      delay: 0.15,
    });
    tl.to(heroBits, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.08,
    }, '-=0.5');
  }

  /* ------------------------------------------------------------------ */
  /* Scroll reveals for general content                                 */
  /* ------------------------------------------------------------------ */
  function initScrollReveals() {
    const items = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !hasGSAP) {
      items.forEach((el) => { el.style.opacity = 1; el.style.transform = 'none'; });
      return;
    }

    items.forEach((el) => {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          once: true,
        },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Parallax orbs in hero                                              */
  /* ------------------------------------------------------------------ */
  function initParallax() {
    const items = document.querySelectorAll('[data-parallax]');
    if (prefersReducedMotion || !hasGSAP || !items.length) return;

    items.forEach((el) => {
      const speed = parseFloat(el.getAttribute('data-parallax')) || 0.2;
      gsap.to(el, {
        y: () => window.innerHeight * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.hero') || el,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.6,
        },
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Project media tilt (image mask / subtle depth on scroll)           */
  /* ------------------------------------------------------------------ */
  function initMediaTilt() {
    const items = document.querySelectorAll('[data-tilt]');
    if (prefersReducedMotion || !hasGSAP || !items.length) return;

    items.forEach((el) => {
      gsap.fromTo(
        el,
        { clipPath: 'inset(6% round 18px)' },
        {
          clipPath: 'inset(0% round 18px)',
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
        }
      );
    });
  }

  /* ------------------------------------------------------------------ */
  /* Magnetic buttons                                                   */
  /* ------------------------------------------------------------------ */
  function initMagnetic() {
    if (prefersReducedMotion || window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.magnetic').forEach((btn) => {
      let bound = null;

      btn.addEventListener('mouseenter', () => {
        bound = btn.getBoundingClientRect();
      });

      btn.addEventListener('mousemove', (e) => {
        if (!bound) bound = btn.getBoundingClientRect();
        const relX = e.clientX - bound.left - bound.width / 2;
        const relY = e.clientY - bound.top - bound.height / 2;
        const strength = 0.35;
        if (hasGSAP) {
          gsap.to(btn, { x: relX * strength, y: relY * strength, duration: 0.5, ease: 'power3.out' });
        } else {
          btn.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
        }
      });

      btn.addEventListener('mouseleave', () => {
        if (hasGSAP) {
          gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
        } else {
          btn.style.transform = 'translate(0,0)';
        }
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Cursor-follow glass dot (desktop only)                             */
  /* ------------------------------------------------------------------ */
  function initCursor() {
    const dot = document.querySelector('.cursor-dot');
    if (!dot || window.matchMedia('(pointer: coarse)').matches) return;

    window.addEventListener('mousemove', (e) => {
      dot.classList.add('is-active');
      if (hasGSAP) {
        gsap.to(dot, { x: e.clientX, y: e.clientY, duration: 0.5, ease: 'power3.out' });
      } else {
        dot.style.left = e.clientX + 'px';
        dot.style.top = e.clientY + 'px';
      }
    });

    document.querySelectorAll('a, button, [data-tilt]').forEach((el) => {
      el.addEventListener('mouseenter', () => dot.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => dot.classList.remove('is-hover'));
    });

    document.addEventListener('mouseleave', () => dot.classList.remove('is-active'));
  }

  /* ------------------------------------------------------------------ */
  /* Contact form (client-side only — no backend wired up)              */
  /* ------------------------------------------------------------------ */
  function initContactForm() {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;

    const success = form.querySelector('[data-form-success]');

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const label = submitBtn.querySelector('span');
      const originalText = label.textContent;

      label.textContent = 'Sending...';
      submitBtn.disabled = true;

      setTimeout(() => {
        label.textContent = originalText;
        submitBtn.disabled = false;
        form.reset();
        if (success) success.classList.add('is-visible');
      }, 900);
    });
  }

  /* ------------------------------------------------------------------ */
  /* Init                                                                */
  /* ------------------------------------------------------------------ */
  function init() {
    initSmoothScroll();
    initAnchorLinks();
    initNav();
    initHeroReveal();
    initScrollReveals();
    initParallax();
    initMediaTilt();
    initMagnetic();
    initCursor();
    initContactForm();

    if (hasGSAP && window.ScrollTrigger) {
      window.addEventListener('load', () => ScrollTrigger.refresh());
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
