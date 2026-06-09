import { initOnce, prefersReducedMotion } from '../core/utils.js';

function initParallax() {
  const hero = document.querySelector('.hero-gradient');
  const card = document.querySelector('.hero-card');
  if (!hero || !card || !initOnce(hero, 'parallax')) return;
  if (prefersReducedMotion()) return;

  card.classList.add('is-parallax-ready');

  // 缓存 layout 高度以避免 mousemove 回调中触发重排
  let heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  window.addEventListener('resize', () => {
    heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
  }, { passive: true });

  let mouseX = 0;
  let mouseY = 0;
  let ticking = false;

  document.addEventListener('mousemove', (e) => {
    if (e.pageY > heroBottom) return;

    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  function updateParallax() {
    const x = (mouseX / window.innerWidth  - 0.5) * 12;
    const y = (mouseY / window.innerHeight - 0.5) * 8;
    card.style.transform = `translate3d(0, -4px, 0) rotateY(${x * 0.3}deg) rotateX(${-y * 0.3}deg)`;
    ticking = false;
  }

  hero.addEventListener('mouseleave', () => {
    card.style.transform = 'translate3d(0, 0, 0) rotateY(0deg) rotateX(0deg)';
  });
}
export { initParallax };
