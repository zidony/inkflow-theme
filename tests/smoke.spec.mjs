import { expect, test } from '@playwright/test';

const pages = [
  'index.html',
  'post-list.html',
  'post-show.html',
  'category-list.html',
  'tag-list.html',
  'archive-list.html',
  'album-list.html',
  'link-list.html',
  'profile.html',
  'login.html',
];

async function expectNoConsoleErrors(page, action) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() !== 'error') return;

    const text = message.text();
    if (/Failed to load resource: net::ERR_(?:NETWORK_ACCESS_DENIED|BLOCKED_BY_CLIENT)/.test(text)) return;

    errors.push(text);
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await action();

  expect(errors, errors.join('\n')).toEqual([]);
}

async function gotoPage(page, pagePath) {
  await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.readyState !== 'loading' && document.title.length > 0);
}

test.describe('dist page smoke', () => {
  for (const pagePath of pages) {
    test(`${pagePath} renders without runtime errors`, async ({ page }) => {
      await expectNoConsoleErrors(page, async () => {
        await gotoPage(page, `/${pagePath}`);
        await expect(page).toHaveTitle(/INKFLOW/);
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('body')).toContainText('INKFLOW');
        await expect(page.locator('link[href*="assets/css/inkflow.css"]')).toHaveCount(1);
        await expect(page.locator('script[src*="assets/js/inkflow.js"]')).toHaveCount(1);
      });
    });
  }
});

test('theme reset removes viewport gaps without external CSS reset', async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/**', route => route.abort());
  await gotoPage(page, '/index.html');

  const metrics = await page.evaluate(() => {
    const bodyStyle = getComputedStyle(document.body);
    const header = document.querySelector('header');
    const footer = document.querySelector('.site-footer');
    const headerRect = header?.getBoundingClientRect();

    window.scrollTo(0, document.documentElement.scrollHeight);
    const footerRect = footer?.getBoundingClientRect();

    return {
      bodyMarginTop: bodyStyle.marginTop,
      bodyMarginBottom: bodyStyle.marginBottom,
      headerTop: headerRect?.top ?? null,
      footerBottomGap: footerRect
        ? Math.max(0, document.documentElement.scrollHeight - (window.scrollY + footerRect.bottom))
        : null,
      headOnlyBodyTags: [...document.body.children]
        .filter(el => ['META', 'LINK', 'TITLE'].includes(el.tagName))
        .map(el => el.tagName),
      contentAfterFooter: footer
        ? [...document.body.children]
            .slice([...document.body.children].indexOf(footer) + 1)
            .filter(el => getComputedStyle(el).position !== 'fixed' && el.getBoundingClientRect().height > 0)
            .map(el => ({ tag: el.tagName, id: el.id, className: el.className }))
        : [],
    };
  });

  expect(metrics.bodyMarginTop).toBe('0px');
  expect(metrics.bodyMarginBottom).toBe('0px');
  expect(metrics.headerTop).toBe(0);
  expect(metrics.footerBottomGap).toBeLessThanOrEqual(1);
  expect(metrics.headOnlyBodyTags).toEqual([]);
  expect(metrics.contentAfterFooter).toEqual([]);
});

test('theme toggle switches document theme', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-bs-theme', 'light');
    await page.getByRole('button', { name: '切换深色与浅色主题' }).click();
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  });
});

test('reduced motion preference disables decorative motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');

    const firstFade = page.locator('.fade-up').first();
    const heroCard = page.locator('.hero-card');

    await expect(firstFade).toHaveClass(/visible/);
    await expect(page.locator('[data-count="128"]')).toHaveText('128');
    await expect(page.locator('[data-count="56"]')).toHaveText('56k');
    await expect(heroCard).not.toHaveClass(/is-parallax-ready/);

    const before = await heroCard.evaluate(el => getComputedStyle(el).transform);
    await page.mouse.move(120, 120);
    await page.waitForTimeout(100);
    const after = await heroCard.evaluate(el => getComputedStyle(el).transform);

    expect(after).toBe(before);
  });
});

test('archive heatmap exposes summary without noisy cells', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/archive-list.html');
    await expect(page.locator('#heatmapGrid')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.heatmap-day')).toHaveCount(371);
    await expect(page.locator('.archive-stat-heat-dot').first()).toHaveAttribute('aria-hidden', 'true');
  });
});

test('mobile navbar toggler exposes collapse state', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');

    const toggler = page.locator('.navbar-toggler');
    const menu = page.locator('#navMenu');

    await expect(toggler).toHaveAttribute('aria-controls', 'navMenu');
    await expect(toggler).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).not.toHaveClass(/show/);

    await toggler.click();
    await expect(toggler).toHaveAttribute('aria-expanded', 'true');
    await expect(menu).toHaveClass(/show/);

    await toggler.click();
    await expect(toggler).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).not.toHaveClass(/show/);
  });
});

test('author social icons are accessible links', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    const homeSocialLinks = page.locator('.author-social a.social-btn');
    await expect(homeSocialLinks).toHaveCount(5);
    await expect(homeSocialLinks.first()).toHaveAttribute('aria-label', 'Twitter / X');
    await expect(homeSocialLinks.nth(0)).toHaveAttribute('rel', /noopener/);

    await gotoPage(page, '/post-show.html');
    const postSocialLinks = page.locator('.social-row a.social-btn');
    await expect(postSocialLinks).toHaveCount(4);
    await expect(postSocialLinks.nth(3)).toHaveAttribute('href', /mailto:/);
  });
});

test('search overlay opens and closes', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    const overlay = page.locator('#searchOverlay');
    await expect(overlay).toHaveAttribute('inert', '');
    await page.getByRole('button', { name: /搜索/ }).click();
    await expect(overlay).toHaveClass(/active/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'false');
    await expect(overlay).not.toHaveAttribute('inert', '');
    const searchInput = page.locator('#searchInput');
    await expect(searchInput).toBeFocused();
    await overlay.getByRole('button', { name: 'JavaScript' }).press('Enter');
    await expect(searchInput).toHaveValue('JavaScript');
    await page.getByRole('button', { name: '关闭搜索' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(overlay.getByRole('button', { name: 'AI' })).toBeFocused();
    await page.getByRole('button', { name: '关闭搜索' }).click();
    await expect(overlay).not.toHaveClass(/active/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
    await expect(overlay).toHaveAttribute('inert', '');
  });
});

test('album lightbox opens and closes', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/album-list.html');
    const lightbox = page.locator('#lightbox');
    await expect(lightbox).toHaveAttribute('inert', '');
    await expect(page.locator('.album-card-hover').first()).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.photo-item-overlay').first()).toHaveAttribute('aria-hidden', 'true');
    await page.locator('[data-lightbox-key="kyoto"]').click();
    await expect(lightbox).toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
    await expect(lightbox).not.toHaveAttribute('inert', '');
    await page.keyboard.press('Shift+Tab');
    await expect(page.getByRole('button', { name: '下一张图片' })).toBeFocused();
    await page.getByRole('button', { name: '下载图片' }).click();
    await expect(page.locator('#inkToast')).toContainText('图片下载功能需要接入真实图片资源');
    await page.getByRole('button', { name: '关闭图片预览' }).click();
    await expect(lightbox).not.toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
    await expect(lightbox).toHaveAttribute('inert', '');
  });
});

test('login tabs switch panels', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/login.html');
    await expect(page.locator('#loginTab')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('#registerTab')).toHaveAttribute('tabindex', '-1');
    await page.getByRole('tab', { name: '注册' }).click();
    await expect(page.locator('#registerForm')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeHidden();
    await expect(page.locator('#loginTab')).toHaveAttribute('tabindex', '-1');
    await expect(page.locator('#registerTab')).toHaveAttribute('tabindex', '0');
    await page.getByRole('button', { name: '立即登录' }).click();
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#registerForm')).toBeHidden();
    await expect(page.locator('#loginTab')).toHaveAttribute('tabindex', '0');
    await expect(page.locator('#registerTab')).toHaveAttribute('tabindex', '-1');
  });
});

test('login submit exposes busy state while processing', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/login.html');

    const loginButton = page.locator('#doLoginBtn');
    await expect(loginButton).toHaveAttribute('aria-busy', 'false');
    await page.locator('#loginEmail').fill('demo@inkflow.dev');
    await page.locator('#loginPassword').fill('password123');
    await loginButton.click();

    await expect(loginButton).toBeDisabled();
    await expect(loginButton).toHaveAttribute('aria-busy', 'true');
    await expect(loginButton).toContainText('登录中');
  });
});

test('profile avatar rejects unsupported files', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/profile.html');
    await page.locator('#avatarInput').setInputFiles({
      name: 'avatar.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    });

    await expect(page.locator('#profileAvatarEl')).not.toHaveClass(/profile-avatar-has-image/);
    await expect(page.locator('#inkToast')).toContainText('请选择 PNG、JPG、WebP 或 GIF 图片');
  });
});

test('profile edit controls toggle readonly fields', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/profile.html');
    const nameInput = page.locator('#profileName');

    await expect(page.locator('#streakDots')).toHaveAttribute('aria-hidden', 'true');
    await expect(nameInput).toHaveAttribute('readonly', '');
    await page.locator('[data-profile-edit="basic"]').click();
    await expect(nameInput).not.toHaveAttribute('readonly', '');
    await page.locator('[data-profile-cancel="basic"]').click();
    await expect(nameInput).toHaveAttribute('readonly', '');
  });
});

test('filter and sort controls use button semantics', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/album-list.html');
    await expect(page.locator('button[data-album-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('button[data-album-filter="city"]').click();
    await expect(page.locator('button[data-album-filter="city"]')).toHaveClass(/active/);
    await expect(page.locator('button[data-album-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[data-album-filter="city"]')).toHaveAttribute('aria-pressed', 'true');

    await gotoPage(page, '/link-list.html');
    await expect(page.locator('button[data-link-filter="all"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('button[data-link-filter="tool"]').click();
    await expect(page.locator('button[data-link-filter="tool"]')).toHaveClass(/active/);
    await expect(page.locator('button[data-link-filter="all"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[data-link-filter="tool"]')).toHaveAttribute('aria-pressed', 'true');

    await gotoPage(page, '/tag-list.html');
    await expect(page.locator('button[data-tag-sort="count"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('button[data-tag-sort="alpha"]').click();
    await expect(page.locator('button[data-tag-sort="alpha"]')).toHaveClass(/active/);
    await expect(page.locator('button[data-tag-sort="count"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[data-tag-sort="alpha"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('button[data-tag-sort="recent"]').click();
    await expect(page.locator('button[data-tag-sort="alpha"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[data-tag-sort="recent"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#tagCloudInner .tag-cloud-item').first()).toContainText('React');
    await expect(page.locator('#tagCloudInner .tag-cloud-hash').first()).toHaveAttribute('aria-hidden', 'true');

    await gotoPage(page, '/archive-list.html');
    await expect(page.locator('button[data-archive-year="2025"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('button[data-archive-year="2024"]').click();
    await expect(page.locator('button[data-archive-year="2025"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('button[data-archive-year="2024"]')).toHaveAttribute('aria-pressed', 'true');

    await gotoPage(page, '/post-list.html');
    await expect(page.locator('#gridBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#listBtn')).toHaveAttribute('aria-pressed', 'false');
    await page.locator('#listBtn').click();
    await expect(page.locator('#gridBtn')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#listBtn')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#gridView')).toHaveClass(/d-none/);
    await expect(page.locator('#listView')).not.toHaveClass(/d-none/);
  });
});

test('link apply form synchronizes expanded state', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/link-list.html');

    const form = page.locator('#linkApplyForm');
    const trigger = page.locator('[data-toggle-link-apply]').first();
    const cancel = page.locator('#linkApplyForm [data-toggle-link-apply]');

    await expect(form).toBeHidden();
    await expect(form).toHaveAttribute('hidden', '');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    await trigger.click();
    await expect(form).toBeVisible();
    await expect(form).toHaveClass(/show/);
    await expect(form).not.toHaveAttribute('hidden', '');
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#linkApplyForm input').first()).toBeFocused();

    await cancel.click();
    await expect(form).toBeHidden();
    await expect(form).toHaveAttribute('hidden', '');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });
});

test('site info copy button exposes busy feedback', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {}
      }
    });
  });

  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/link-list.html');
    const copyButton = page.locator('[data-copy-site-info]');

    await expect(copyButton).toHaveAttribute('aria-busy', 'false');
    await expect(copyButton).toHaveAttribute('aria-label', '复制本站信息');

    await copyButton.click();
    await expect(copyButton).toBeDisabled();
    await expect(copyButton).toHaveAttribute('aria-busy', 'true');
    await expect(copyButton).toHaveAttribute('aria-label', '本站信息已复制');
    await expect(copyButton).toContainText('已复制本站信息');
    await expect(page.locator('#inkToast')).toContainText('站点信息已复制');

    await expect(copyButton).toHaveAttribute('aria-busy', 'false', { timeout: 3000 });
    await expect(copyButton).toHaveAttribute('aria-label', '复制本站信息');
  });
});

test('form inputs expose browser assistance hints', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/tag-list.html');
    await expect(page.locator('#tagSearch')).toHaveAttribute('type', 'search');
    await expect(page.locator('#tagSearch')).toHaveAttribute('autocomplete', 'off');

    await gotoPage(page, '/link-list.html');
    await expect(page.locator('input[aria-label="联系邮箱"]')).toHaveAttribute('autocomplete', 'email');
    await expect(page.locator('input[aria-label="博客地址"]')).toHaveAttribute('autocomplete', 'url');

    await gotoPage(page, '/index.html');
    await expect(page.locator('input[aria-label="订阅邮箱地址"]').first()).toHaveAttribute('autocomplete', 'email');
  });
});

test('stateful controls update aria state', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/post-show.html');

    await expect(page.locator('.toc-list a.active')).toHaveAttribute('aria-current', 'location');

    const likeBtn = page.locator('#likeBtn');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'false');
    await likeBtn.focus();
    await page.keyboard.press('Enter');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(likeBtn).toHaveAttribute('aria-label', '取消点赞');

    const bookmarkBtn = page.locator('[data-toggle-bookmark]');
    await expect(bookmarkBtn).toHaveAttribute('aria-pressed', 'false');
    await bookmarkBtn.focus();
    await page.keyboard.press('Enter');
    await expect(bookmarkBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(bookmarkBtn).toHaveAttribute('aria-label', '取消书签');

    const reactionBtn = page.locator('[data-toggle-react]').nth(1);
    await expect(reactionBtn).toHaveAttribute('aria-pressed', 'false');
    await reactionBtn.click();
    await expect(reactionBtn).toHaveAttribute('aria-pressed', 'true');

    await gotoPage(page, '/login.html');
    await expect(page.locator('label[for="loginEmail"]')).toHaveText('邮箱地址');
    await expect(page.locator('#loginEmail')).toHaveAttribute('autocomplete', 'email');
    const passwordToggle = page.locator('.auth-pwd-toggle');
    await expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(passwordToggle).toHaveAttribute('aria-label', '显示密码');
    await passwordToggle.focus();
    await page.keyboard.press('Enter');
    await expect(passwordToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(passwordToggle).toHaveAttribute('aria-label', '隐藏密码');
  });
});

test('copy link feedback stays on clicked button', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async () => {}
      }
    });
  });

  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/post-show.html');

    const floatingCopy = page.locator('.float-btn[data-copy-link]');
    const shareCopy = page.locator('.share-btn.link-copy');

    await expect(floatingCopy).toHaveAttribute('aria-label', '复制文章链接');
    await expect(shareCopy).toHaveAttribute('aria-label', '复制文章链接');

    await floatingCopy.click();
    await expect(floatingCopy).toHaveAttribute('aria-label', '文章链接已复制');
    await expect(floatingCopy.locator('.bi-check-lg')).toHaveCount(1);
    await expect(shareCopy).toHaveAttribute('aria-label', '复制文章链接');

    await floatingCopy.click();
    await expect(floatingCopy.locator('.bi-check-lg')).toHaveCount(1);
    await expect(floatingCopy).toHaveAttribute('aria-label', '复制文章链接', { timeout: 3000 });

    await shareCopy.scrollIntoViewIfNeeded();
    await expect(shareCopy).toBeVisible();
    await expect.poll(async () => shareCopy.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      const centerTarget = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return el.contains(centerTarget);
    })).toBe(true);
    await shareCopy.click();
    await expect(shareCopy).toHaveAttribute('aria-label', '文章链接已复制');
    await expect(shareCopy).toContainText('已复制');
    await expect(floatingCopy).toHaveAttribute('aria-label', '复制文章链接');
  });
});

test('demo action buttons show integration feedback', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    await page.locator('[data-demo-message*="订阅功能"]').first().click();
    await expect(page.locator('#inkToast')).toContainText('订阅功能需要接入邮件服务或后端 API');

    await gotoPage(page, '/login.html');
    await page.locator('[data-demo-message*="Google"]').click();
    await expect(page.locator('#inkToast')).toContainText('Google 登录需要接入 OAuth 服务');
    await page.locator('[data-demo-message*="密码找回"]').click();
    await expect(page.locator('#inkToast')).toContainText('密码找回需要接入账号恢复服务');
    await page.locator('[data-auth-switch="registerForm"]').click();
    await page.locator('#doRegisterBtn').click();
    await expect(page.locator('#inkToast')).toContainText('注册功能需要接入账号注册 API');

    await gotoPage(page, '/post-show.html');
    await page.locator('.comment-action[data-demo-message*="评论回复"]').first().click();
    await expect(page.locator('#inkToast')).toContainText('评论回复需要接入评论 API');

    await gotoPage(page, '/post-list.html');
    await expect(page.locator('.page-link[aria-current="page"]')).toBeDisabled();
    await page.getByRole('button', { name: '下一页' }).click();
    await expect(page.locator('#inkToast')).toContainText('分页功能需要接入文章列表数据源或后端 API');

    await gotoPage(page, '/profile.html');
    await page.locator('[data-demo-message*="通知偏好保存"]').click();
    await expect(page.locator('#inkToast')).toContainText('通知偏好保存需要接入用户设置 API');
  });
});

test('user menu avatar exposes expanded state', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto('/index.html');
    await page.evaluate(() => {
      localStorage.setItem('inkflow-user', JSON.stringify({ name: '陈明远', initial: '陈' }));
    });
    await gotoPage(page, '/index.html');

    const avatar = page.locator('#navUserAvatar');
    const wrapper = page.locator('#navUserWrapper');
    await expect(wrapper).toHaveClass(/d-flex/);
    await expect(avatar).toHaveAttribute('aria-expanded', 'false');
    await avatar.click();
    await expect(avatar).toHaveAttribute('aria-expanded', 'true');
    await expect(wrapper).toHaveClass(/open/);
    await page.keyboard.press('Escape');
    await expect(avatar).toHaveAttribute('aria-expanded', 'false');
    await expect(wrapper).not.toHaveClass(/open/);
  });
});

test('stored demo auth state is validated before restore', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto('/index.html');
    await page.evaluate(() => {
      localStorage.setItem('inkflow-user', JSON.stringify({ name: 42, initial: {} }));
    });
    await gotoPage(page, '/index.html');

    await expect(page.locator('#navLoginBtn')).toBeVisible();
    await expect(page.locator('#navUserWrapper')).toHaveClass(/d-none/);
    await expect.poll(async () => page.evaluate(() => localStorage.getItem('inkflow-user'))).toBeNull();
  });
});

test('toast messages expose live region semantics', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    await page.locator('[data-demo-action]').first().click();
    const toast = page.locator('#inkToast');
    await expect(toast).toHaveAttribute('role', 'status');
    await expect(toast).toHaveAttribute('aria-live', 'polite');

    await gotoPage(page, '/profile.html');
    await page.locator('#avatarInput').setInputFiles({
      name: 'avatar.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    });
    const errorToast = page.locator('#inkToast');
    await expect(errorToast).toHaveAttribute('role', 'alert');
    await expect(errorToast).toHaveAttribute('aria-live', 'assertive');
  });
});

test('profile danger action uses themed confirmation modal', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/profile.html');
    const modal = page.locator('#accountDeleteModal');
    const deleteButton = page.locator('[data-confirm-delete]');

    await deleteButton.click();
    await expect(modal).toHaveClass(/show/);
    await expect(modal).toHaveAttribute('aria-modal', 'true');
    await modal.getByRole('button', { name: '关闭' }).focus();
    await page.keyboard.press('Shift+Tab');
    await expect(modal.locator('[data-confirm-delete-submit]')).toBeFocused();

    await modal.locator('.modal-footer [data-bs-dismiss="modal"]').first().click();
    await expect(modal).not.toHaveClass(/show/);
    await expect(deleteButton).toBeFocused();

    await deleteButton.click();
    await modal.locator('[data-confirm-delete-submit]').click();
    await expect(modal).not.toHaveClass(/show/);
    await expect(page.locator('#inkToast')).toContainText('账号注销申请已提交，请检查邮箱确认');
  });
});
