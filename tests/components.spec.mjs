import { expect, test } from '@playwright/test';

async function gotoPage(page, pagePath) {
  await page.goto(pagePath, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.readyState !== 'loading' && document.title.length > 0);
}

test('Inkflow global API is exposed with version, components and events', async ({ page }) => {
  await gotoPage(page, '/index.html');
  const api = await page.evaluate(() => ({
    version: window.Inkflow?.version,
    hasInit: typeof window.Inkflow?.init === 'function',
    hasDestroy: typeof window.Inkflow?.destroy === 'function',
    hasToast: typeof window.Inkflow?.components?.toast?.show === 'function',
    hasLightbox: typeof window.Inkflow?.components?.lightbox?.open === 'function',
    hasTagCloud: typeof window.Inkflow?.components?.tagCloud?.render === 'function',
    hasEvents: typeof window.Inkflow?.events?.on === 'function',
  }));
  expect(api.version).toMatch(/^\d+\.\d+\.\d+/);
  expect(api.hasInit).toBe(true);
  expect(api.hasDestroy).toBe(true);
  expect(api.hasToast).toBe(true);
  expect(api.hasLightbox).toBe(true);
  expect(api.hasTagCloud).toBe(true);
  expect(api.hasEvents).toBe(true);
});

test('pages ship no inline executable scripts (CSP readiness)', async ({ page }) => {
  await gotoPage(page, '/index.html');
  const inline = await page.evaluate(() => {
    return [...document.querySelectorAll('script')]
      .filter((s) => !s.src && s.type !== 'application/json' && s.type !== 'application/ld+json')
      .map((s) => s.id || s.type);
  });
  expect(inline).toEqual([]);
});

test('theme persistence works through the external pre-paint script', async ({ page }) => {
  await gotoPage(page, '/index.html');
  await page.evaluate(() => localStorage.setItem('inkflow-theme', 'dark'));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-bs-theme', 'dark');
});

test('toast component and legacy ink_toast alias both work', async ({ page }) => {
  await gotoPage(page, '/index.html');
  await page.evaluate(() => window.Inkflow.components.toast.show('component toast', 'success'));
  await expect(page.locator('#inkToast')).toContainText('component toast');
  await page.evaluate(() => window.ink_toast('legacy alias toast', 'success'));
  await expect(page.locator('#inkToast')).toContainText('legacy alias toast');
});

test('tag cloud renders from the JSON data script and filters on search', async ({ page }) => {
  await gotoPage(page, '/tag-list.html');
  const items = page.locator('#tagCloudInner .tag-cloud-item');
  await expect(items.first()).toBeVisible();
  expect(await items.count()).toBeGreaterThan(10);

  await page.locator('[data-tag-sort="alpha"]').click();
  await page.locator('#tagSearch').fill('JavaScript');
  await expect(items).toHaveCount(1);
  await expect(page.locator('#tagResultStatus')).toContainText('找到 1 个匹配标签');

  await page.locator('#tagSearch').fill('不存在标签XYZ');
  await expect(page.locator('#tagResultStatus')).toContainText('未找到');
});

test('lightbox opens real images via data-lightbox-url and closes', async ({ page }) => {
  await gotoPage(page, '/album-list.html');
  await page.evaluate(() => {
    const trigger = document.createElement('button');
    trigger.dataset.lightboxUrl = '/og-cover.png';
    trigger.dataset.lightboxTitle = 'OG Cover';
    trigger.id = 'testLbTrigger';
    trigger.textContent = 'open';
    document.body.appendChild(trigger);
  });

  await page.locator('#testLbTrigger').click();
  await expect(page.locator('#lightbox')).toHaveClass(/active/);
  await expect(page.locator('#lbImg img')).toHaveAttribute('src', /og-cover\.png/);
  await expect(page.locator('#lbCaption')).toHaveText('OG Cover');

  await page.locator('#lightbox .lb-close').click();
  await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
  await expect(page.locator('#lightbox')).toHaveAttribute('inert', '');
});

test('lightbox traps Tab focus and restores it on close', async ({ page }) => {
  await gotoPage(page, '/album-list.html');
  const trigger = page.locator('.photo-action-btn[aria-label="预览大图"]').first();
  await trigger.click();
  await expect(page.locator('#lightbox')).toHaveClass(/active/);
  await expect(page.locator('#lightbox .lb-close')).toBeFocused();

  // Tab repeatedly — focus must never leave the lightbox (trap), then Escape closes
  let escaped = false;
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    const inside = await page.evaluate(() => document.getElementById('lightbox').contains(document.activeElement));
    if (!inside) { escaped = true; break; }
  }
  expect(escaped).toBe(false);

  await page.keyboard.press('Escape');
  await expect(page.locator('#lightbox')).not.toHaveClass(/active/);
  await expect(trigger).toBeFocused();
});

test('component errors are observable via inkflow:error', async ({ page }) => {
  // Corrupt the demo auth storage before the page boots: restore() must
  // surface a normalized inkflow:error instead of failing silently.
  await page.addInitScript(() => {
    localStorage.setItem('inkflow-user', '{corrupt-json');
    window.__inkflowErrors = [];
    document.addEventListener('inkflow:error', (e) => window.__inkflowErrors.push(e.detail));
  });
  await gotoPage(page, '/index.html');
  const errors = await page.evaluate(() => window.__inkflowErrors);
  expect(errors.some((e) => e.component === 'auth' && e.operation === 'restore' && e.error)).toBe(true);
});

test('like toggle event can be consumed by an adapter (no demo state change)', async ({ page }) => {
  await gotoPage(page, '/post-show.html');
  const countBefore = (await page.locator('#likeCount').textContent()).trim();

  await page.evaluate(() => {
    window.Inkflow.events.on('inkflow:like-toggle', (e) => e.preventDefault());
  });
  await page.locator('#likeBtn').click();

  await expect(page.locator('#likeCount')).toHaveText(countBefore);
  await expect(page.locator('#likeBtn')).not.toHaveClass(/active/);
});

test('avatar change event can be consumed by an adapter', async ({ page }) => {
  await gotoPage(page, '/profile.html');
  await page.evaluate(() => {
    window.Inkflow.events.on('inkflow:avatar-change', (e) => e.preventDefault());
  });
  await page.locator('#avatarInput').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64'
    ),
  });
  // Consumed by the adapter: no local preview state may appear.
  await expect(page.locator('#profileAvatarEl')).not.toHaveClass(/profile-avatar-has-image/);
});

test('category filter standard contract filters items and announces count', async ({ page }) => {
  await gotoPage(page, '/index.html');
  await page.evaluate(() => {
    const scope = document.createElement('div');
    scope.dataset.filterScope = '';
    scope.innerHTML = [
      '<button data-filter-value="all" aria-pressed="true">全部</button>',
      '<button data-filter-value="a" aria-pressed="false">A</button>',
      '<div data-filter-category="a" id="itemA">A item</div>',
      '<div data-filter-category="b" id="itemB">B item</div>',
      '<output data-filter-status role="status" aria-live="polite"></output>',
    ].join('');
    document.body.appendChild(scope);
    window.Inkflow.components.categoryFilter.initScope();
  });

  await page.locator('[data-filter-value="a"]').click();
  await expect(page.locator('#itemA')).not.toHaveClass(/is-filtered-out/);
  await expect(page.locator('#itemB')).toHaveClass(/is-filtered-out/);
  await expect(page.locator('[data-filter-status]')).toContainText('A分类显示 1 个');

  await page.locator('[data-filter-value="all"]').click();
  await expect(page.locator('#itemB')).not.toHaveClass(/is-filtered-out/);
});
