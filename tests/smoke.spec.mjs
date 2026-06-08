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

test('theme toggle switches document theme', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-bs-theme', 'light');
    await page.getByRole('button', { name: '切换深色与浅色主题' }).click();
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
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
    await page.locator('[data-lightbox-key="kyoto"]').click();
    await expect(lightbox).toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
    await expect(lightbox).not.toHaveAttribute('inert', '');
    await page.getByRole('button', { name: '关闭图片预览' }).click();
    await expect(lightbox).not.toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
    await expect(lightbox).toHaveAttribute('inert', '');
  });
});

test('login tabs switch panels', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/login.html');
    await page.getByRole('tab', { name: '注册' }).click();
    await expect(page.locator('#registerForm')).toBeVisible();
    await expect(page.locator('#loginForm')).toBeHidden();
    await page.getByRole('button', { name: '立即登录' }).click();
    await expect(page.locator('#loginForm')).toBeVisible();
    await expect(page.locator('#registerForm')).toBeHidden();
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

test('filter and sort controls use button semantics', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/album-list.html');
    await page.locator('button[data-album-filter="city"]').click();
    await expect(page.locator('button[data-album-filter="city"]')).toHaveClass(/active/);

    await gotoPage(page, '/link-list.html');
    await page.locator('button[data-link-filter="tool"]').click();
    await expect(page.locator('button[data-link-filter="tool"]')).toHaveClass(/active/);

    await gotoPage(page, '/tag-list.html');
    await page.locator('button[data-tag-sort="alpha"]').click();
    await expect(page.locator('button[data-tag-sort="alpha"]')).toHaveClass(/active/);
  });
});

test('stateful controls update aria state', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/post-show.html');

    const likeBtn = page.locator('#likeBtn');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'false');
    await likeBtn.focus();
    await page.keyboard.press('Enter');
    await expect(likeBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(likeBtn).toHaveAttribute('aria-label', '取消点赞');

    const reactionBtn = page.locator('[data-toggle-react]').nth(1);
    await expect(reactionBtn).toHaveAttribute('aria-pressed', 'false');
    await reactionBtn.click();
    await expect(reactionBtn).toHaveAttribute('aria-pressed', 'true');

    await gotoPage(page, '/login.html');
    const passwordToggle = page.locator('.auth-pwd-toggle');
    await expect(passwordToggle).toHaveAttribute('aria-pressed', 'false');
    await expect(passwordToggle).toHaveAttribute('aria-label', '显示密码');
    await passwordToggle.focus();
    await page.keyboard.press('Enter');
    await expect(passwordToggle).toHaveAttribute('aria-pressed', 'true');
    await expect(passwordToggle).toHaveAttribute('aria-label', '隐藏密码');
  });
});

test('demo action buttons show integration feedback', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await gotoPage(page, '/index.html');
    await page.locator('[data-demo-action]').first().click();
    await expect(page.locator('#inkToast')).toContainText('订阅功能需要接入邮件服务或后端 API');

    await gotoPage(page, '/login.html');
    await page.locator('[data-demo-message*="Google"]').click();
    await expect(page.locator('#inkToast')).toContainText('Google 登录需要接入 OAuth 服务');
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

    await modal.locator('[data-bs-dismiss="modal"]').last().click();
    await expect(modal).not.toHaveClass(/show/);

    await deleteButton.click();
    await modal.locator('[data-confirm-delete-submit]').click();
    await expect(modal).not.toHaveClass(/show/);
    await expect(page.locator('#inkToast')).toContainText('账号注销申请已提交，请检查邮箱确认');
  });
});
