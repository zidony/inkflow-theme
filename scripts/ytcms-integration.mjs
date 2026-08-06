/* Live integration verification for the YTCMS standard theme (v3.3.2+).
 *
 * Validates the photo hover actions (zoom lightbox + enter detail), login
 * layout overflow fix, search input styling and lightbox wiring against a
 * running YTCMS instance.
 *
 * Prereqs:
 *   - YTCMS running at https://ytcms.test (WAMP Apache, 127.0.0.1 hosts entry)
 *   - template cache cleared after theme edits: rm -rf writable/cache/templates/*
 *   - a login-optional demo user is not required; the checks are UI-level
 *
 * Run: node scripts/ytcms-integration.mjs
 */
import { chromium } from '@playwright/test';

const BASE = 'https://ytcms.test';
const results = [];
const browser = await chromium.launch({ ignoreHTTPSErrors: true });

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'ok ' : 'FAIL'} ${name}${detail ? ' — ' + detail : ''}`);
}

async function open(page, path) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1300);
  return errors;
}

// 1) 搜索框边框（问题1）
{
  const page = await browser.newPage();
  const errors = await open(page, '/search?q=test');
  const border = await page.evaluate(() => {
    const el = document.querySelector('input[name="q"]');
    if (!el) return 'no-input';
    const cs = getComputedStyle(el);
    return `${cs.borderStyle} ${cs.borderWidth} ${cs.borderColor}`;
  });
  record('搜索框有边框(ink-input-gray)', !border.startsWith('none') && border !== 'no-input' && /solid/.test(border), border);
  record('搜索框页无 console error', errors.length === 0, errors.join(' | '));
  await page.close();
}

// 2) 登录页溢出（问题2）
{
  const page = await browser.newPage();
  await open(page, '/login');
  const backLinkVisible = await page.locator('.auth-back-link').isVisible();
  const registerLinkVisible = await page.getByRole('button', { name: '立即注册' }).isVisible();
  // 验证码存在？
  const hasCaptcha = await page.locator('#login_captcha').count();
  // 底部注册链接可达（滚动后可见）
  await page.getByRole('button', { name: '立即注册' }).scrollIntoViewIfNeeded();
  const registerAfterScroll = await page.getByRole('button', { name: '立即注册' }).isVisible();
  const rightScrollable = await page.evaluate(() => {
    const el = document.querySelector('.auth-right');
    return el ? el.scrollHeight > el.clientHeight : false;
  });
  record('登录页 返回首页可见', backLinkVisible);
  record('登录页 注册链接可见(初始或滚动可达)', registerLinkVisible || registerAfterScroll, `captcha=${hasCaptcha} scrollable=${rightScrollable}`);
  await page.close();
}

// 3) 相册详情页照片交互（问题4）
{
  const page = await browser.newPage();
  const errors = await open(page, '/album/1');
  const zoomBtns = await page.locator('.photo-action-btn[aria-label="预览大图"]').count();
  const cardLinks = await page.locator('.photo-action-btn[href*="/file/"]').count();
  record('相册页 无 console error', errors.length === 0, errors.join(' | '));
  record('相册页 放大镜按钮', zoomBtns > 0, `zoom=${zoomBtns}`);
  record('相册页 卡片链接到详情', cardLinks > 0, `links=${cardLinks}`);
  const enterBtns = await page.locator('.photo-action-btn[aria-label="查看详情"]').count();
  record('相册页 进入详情按钮', enterBtns > 0, `enter=${enterBtns}`);
  if (zoomBtns > 0) {
    await page.locator('.photo-item').first().hover();
    await page.waitForTimeout(400);
    const actionsVisible = await page.locator('.photo-actions').first().isVisible();
    record('hover 显示两个动作按钮', actionsVisible);
    await page.locator('.photo-action-btn[aria-label="预览大图"]').first().click();
    await page.waitForTimeout(600);
    const active = await page.locator('#lightbox.active').count();
    const imgOk = await page.evaluate(() => {
      const img = document.querySelector('#lbImg img.lb-image');
      return img ? img.naturalWidth > 0 : false;
    });
    record('放大镜打开灯箱(真实图片)', active === 1 && imgOk);
    await page.locator('#lightbox .lb-close').click();
    await page.waitForTimeout(300);
    record('灯箱关闭', (await page.locator('#lightbox.active').count()) === 0);
  }
  // 卡片导航（不实际跳转，只验证 href 目标正确）
  const hrefs = await page.locator('.photo-action-btn[href*="/file/"]').evaluateAll((els) => els.slice(0, 3).map((e) => e.getAttribute('href')));
  record('详情链接格式', hrefs.length > 0 && hrefs.every((h) => /\/file\/\d+/.test(h)), hrefs.join(' '));
  await page.close();
}

// 4) 相册列表页（问题3 关联）
{
  const page = await browser.newPage();
  const errors = await open(page, '/albums');
  const zoomBtns = await page.locator('.photo-action-btn[aria-label="预览大图"]').count();
  const cardLinks = await page.locator('.photo-action-btn[href*="/file/"]').count();
  record('相册列表页 无 console error', errors.length === 0, errors.join(' | '));
  record('相册列表页 放大镜+详情链接', zoomBtns > 0 && cardLinks > 0, `zoom=${zoomBtns} links=${cardLinks}`);
  await page.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} 通过`);
process.exit(failed.length ? 1 : 0);
