import { copyText, escapeCssString, initOnce } from '../core/utils.js';

function initReadingProgress() {
  const bar = document.getElementById('readingProgress');
  if (!bar || !initOnce(bar, 'readingProgress')) return;

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
  const tocRoot = document.querySelector('.toc-list');
  if (!tocLinks.length || !headings.length || !initOnce(tocRoot, 'tocSpy')) return;

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
        const targetLink = document.querySelector(`.toc-list a[href="#${escapeCssString(id)}"]`);
        
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
  if (likeBtn && likeCount && initOnce(likeBtn, 'reactionLike')) {
    let liked = false;
    likeBtn.addEventListener('click', () => {
      liked = !liked;
      likeBtn.classList.toggle('active', liked);
      likeBtn.classList.toggle('liked', liked);
      likeBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      likeBtn.setAttribute('aria-label', liked ? '取消点赞' : '点赞');
      
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
  const root = document.querySelector('#comments')?.closest('.col-lg-8') || document.body;
  if (!initOnce(root, 'postActions')) return;

  document.addEventListener('click', (e) => {
    const reactBtn = e.target.closest('[data-toggle-react]');
    if (reactBtn) {
      toggleReact(reactBtn);
      return;
    }

    const copyCodeBtn = e.target.closest('[data-copy-code]');
    if (copyCodeBtn) {
      copyCode(copyCodeBtn);
      return;
    }

    if (e.target.closest('[data-copy-link]')) {
      copyLink();
      return;
    }

    const bookmarkBtn = e.target.closest('[data-toggle-bookmark]');
    if (bookmarkBtn) {
      toggleBookmark(bookmarkBtn);
      return;
    }

    if (e.target.closest('[data-scroll-comments]')) {
      scrollToComments();
    }
  });
}

function toggleReact(el) {
  el.classList.toggle('active');
  const active = el.classList.contains('active');
  el.setAttribute('aria-pressed', active ? 'true' : 'false');
  const span = el.querySelector('.count');
  if (span) span.textContent = parseInt(span.textContent) + (active ? 1 : -1);
}

function toggleBookmark(el) {
  el.classList.toggle('active');
  const active = el.classList.contains('active');
  el.setAttribute('aria-pressed', active ? 'true' : 'false');
  el.setAttribute('aria-label', active ? '取消书签' : '书签');
  const icon = el.querySelector('i');
  if (icon) icon.className = active ? 'bi bi-bookmark-fill' : 'bi bi-bookmark';
}

function setButtonFeedback(btn, iconClass, text, ariaLabel) {
  const icon = document.createElement('i');
  icon.className = `bi ${iconClass} me-1`;
  icon.setAttribute('aria-hidden', 'true');
  btn.replaceChildren(icon, document.createTextNode(text));
  btn.setAttribute('aria-label', ariaLabel);
}

function restoreButtonContent(btn, nodes, ariaLabel) {
  btn.replaceChildren(...nodes.map(node => node.cloneNode(true)));
  btn.setAttribute('aria-label', ariaLabel);
}

function copyCode(btn) {
  const code = btn.closest('pre')?.querySelector('code');
  if (!code) return;

  const originalNodes = [...btn.childNodes].map(node => node.cloneNode(true));
  const origAriaLabel = btn.getAttribute('aria-label') || '复制代码';
  copyText(code.textContent)
    .then(() => {
      setButtonFeedback(btn, 'bi-check-lg', '已复制', '代码已复制');
    })
    .catch(() => {
      setButtonFeedback(btn, 'bi-exclamation-triangle', '复制失败', '代码复制失败');
    })
    .finally(() => {
      setTimeout(() => {
        restoreButtonContent(btn, originalNodes, origAriaLabel);
      }, 1500);
    });
}

function copyLink() {
  const btn = document.querySelector('.share-btn.link-copy');
  if (!btn) return;
  const originalNodes = [...btn.childNodes].map(node => node.cloneNode(true));
  const origAriaLabel = btn.getAttribute('aria-label') || '复制文章链接';
  copyText(window.location.href)
    .then(() => {
      setButtonFeedback(btn, 'bi-check-lg', ' 已复制', '文章链接已复制');
    })
    .catch(() => {
      setButtonFeedback(btn, 'bi-exclamation-triangle', ' 复制失败', '文章链接复制失败');
    })
    .finally(() => {
      setTimeout(() => {
        restoreButtonContent(btn, originalNodes, origAriaLabel);
      }, 1500);
    });
}

function scrollToComments() {
  const comments = document.getElementById('comments');
  if (comments) comments.scrollIntoView({ behavior: 'smooth' });
}
export { initReadingProgress, initTocSpy, initReactions, initPostActions };
