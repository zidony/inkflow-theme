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

test.describe('dist page smoke', () => {
  for (const pagePath of pages) {
    test(`${pagePath} renders without runtime errors`, async ({ page }) => {
      await expectNoConsoleErrors(page, async () => {
        await page.goto(`/${pagePath}`, { waitUntil: 'domcontentloaded' });
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
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-bs-theme', 'light');
    await page.getByRole('button', { name: '切换深色与浅色主题' }).click();
    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
  });
});

test('search overlay opens and closes', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    const overlay = page.locator('#searchOverlay');
    await page.getByRole('button', { name: /搜索/ }).click();
    await expect(overlay).toHaveClass(/active/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'false');
    await page.getByRole('button', { name: '关闭搜索' }).click();
    await expect(overlay).not.toHaveClass(/active/);
    await expect(overlay).toHaveAttribute('aria-hidden', 'true');
  });
});

test('album lightbox opens and closes', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto('/album-list.html', { waitUntil: 'domcontentloaded' });
    const lightbox = page.locator('#lightbox');
    await page.locator('[data-lightbox-key="kyoto"]').click();
    await expect(lightbox).toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'false');
    await page.getByRole('button', { name: '关闭图片预览' }).click();
    await expect(lightbox).not.toHaveClass(/active/);
    await expect(lightbox).toHaveAttribute('aria-hidden', 'true');
  });
});

test('login tabs switch panels', async ({ page }) => {
  await expectNoConsoleErrors(page, async () => {
    await page.goto('/login.html', { waitUntil: 'domcontentloaded' });
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
    await page.goto('/profile.html', { waitUntil: 'domcontentloaded' });
    await page.locator('#avatarInput').setInputFiles({
      name: 'avatar.svg',
      mimeType: 'image/svg+xml',
      buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    });

    await expect(page.locator('#profileAvatarEl')).not.toHaveClass(/profile-avatar-has-image/);
    await expect(page.locator('#inkToast')).toContainText('请选择 PNG、JPG、WebP 或 GIF 图片');
  });
});
