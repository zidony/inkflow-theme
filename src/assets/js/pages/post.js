import { copyText } from '../core/utils.js';

function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar) return;

  function updateProgress() {
    const doc = document.documentElement;
    const scrollHeight = doc.scrollHeight - doc.clientHeight;
    const pct = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    bar.style.setProperty('--reading-progress', `${pct}%`);
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
}

function initTocSpy() {
  const tocLinks = document.querySelectorAll('.toc-list a');
  const headings = document.querySelectorAll('h2[id], h3[id]');
  if (!tocLinks.length || !headings.length) return;

  const activeClass = 'active';
  let currentActive = null;

  const observerOptions = {
    rootMargin: '-100px 0px -65% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const targetLink = document.querySelector(`.toc-list a[href="#${id}"]`);
        
        if (targetLink && targetLink !== currentActive) {
          if (currentActive) currentActive.classList.remove(activeClass);
          targetLink.classList.add(activeClass);
          currentActive = targetLink;
        }
      }
    });
  }, observerOptions);

  headings.forEach(h => observer.observe(h));
}

function initReactions() {
  const likeBtn   = document.getElementById('likeBtn');
  const likeCount = document.getElementById('likeCount');
  if (likeBtn && likeCount) {
    let liked = false;
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeBtn.classList.toggle('active', liked);
      likeBtn.classList.toggle('liked', liked);
      
      const icon = likeBtn.querySelector('i');
      if (icon) {
        icon.className = liked ? 'bi bi-heart-fill text-danger' : 'bi bi-heart';
      }

      const countVal = parseInt(likeCount.textContent) || 0;
      likeCount.textContent = liked ? countVal + 1 : Math.max(0, countVal - 1);
      
      likeBtn.classList.add('is-pressed');
      setTimeout(() => { likeBtn.classList.remove('is-pressed'); }, 200);
    });
  }
}

function initPostActions() {
  document.querySelectorAll('[data-toggle-react]').forEach(btn => {
    btn.addEventListener('click', () => toggleReact(btn));
  });

  document.querySelectorAll('[data-copy-code]').forEach(btn => {
    btn.addEventListener('click', () => copyCode(btn));
  });

  document.querySelectorAll('[data-copy-link]').forEach(btn => {
    btn.addEventListener('click', copyLink);
  });

  document.querySelectorAll('[data-scroll-comments]').forEach(btn => {
    btn.addEventListener('click', scrollToComments);
  });
}

function toggleReact(el) {
  el.classList.toggle('active');
  const span = el.querySelector('.count');
  if (span) span.textContent = parseInt(span.textContent) + (el.classList.contains('active') ? 1 : -1);
}

function copyCode(btn) {
  const code = btn.closest('pre')?.querySelector('code');
  if (!code) return;

  const orig = btn.innerHTML;
  copyText(code.textContent)
    .then(() => {
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i>已复制';
    })
    .catch(() => {
      btn.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i>复制失败';
    })
    .finally(() => {
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    });
}

function copyLink() {
  const btn = document.querySelector('.share-btn.link-copy');
  if (!btn) return;
  const orig = btn.innerHTML;
  copyText(window.location.href)
    .then(() => {
      btn.innerHTML = '<i class="bi bi-check-lg me-1"></i> 已复制';
    })
    .catch(() => {
      btn.innerHTML = '<i class="bi bi-exclamation-triangle me-1"></i> 复制失败';
    })
    .finally(() => {
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    });
}

function scrollToComments() {
  const comments = document.getElementById('comments');
  if (comments) comments.scrollIntoView({ behavior: 'smooth' });
}
export { initReadingProgress, initTocSpy, initReactions, initPostActions };
