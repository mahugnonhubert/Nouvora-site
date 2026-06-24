/* ============================================
   BIBLIOTHÈQUE NUMÉRIQUE — ANIMATIONS JS
   Scroll-triggered reveals, counters, effects
   ============================================ */

'use strict';

// Stagger children animations
function initStaggerCards() {
  const grids = document.querySelectorAll('[data-stagger]');
  grids.forEach(grid => {
    const children = grid.children;
    Array.from(children).forEach((child, i) => {
      child.classList.add('reveal');
      child.style.transitionDelay = `${i * 0.07}s`;
    });
  });
}

// Parallax subtle effect on hero
function initParallax() {
  const hero = document.querySelector('.hero-visual');
  if (!hero) return;

  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (scrolled < window.innerHeight) {
      hero.style.transform = `translateY(${scrolled * 0.08}px)`;
    }
  }, { passive: true });
}

// Typewriter effect (optional)
function typeWriter(el, text, speed = 50) {
  if (!el) return;
  let i = 0;
  el.textContent = '';
  const type = () => {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    }
  };
  type();
}

document.addEventListener('DOMContentLoaded', () => {
  initStaggerCards();
  initParallax();
});
