import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createHmac } from 'node:crypto';

// Run only against an isolated development DB; this creates test catalog/orders.
const require = createRequire(new URL('../frontend/package.json', import.meta.url));
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const origin = process.env.VERIFY_FRONTEND_URL || 'http://localhost:5173';
const api = process.env.VERIFY_API_URL || 'http://127.0.0.1:8080/api/v1';
const artifacts = resolve('.verification');
await mkdir(artifacts, { recursive: true });
const results = [];
const issues = [];
const redact = message => String(message).replace(/\b(?:sk_(?:test|live)_[A-Za-z0-9]+|whsec_[A-Za-z0-9]+)\b/g, '<REDACTED>');
const check = async (name, run) => {
  try { await run(); results.push({ name, status: 'pass' }); console.log(`PASS ${name}`); }
  catch (error) { results.push({ name, status: 'fail', error: redact(error.message) }); throw error; }
};
async function request(path, { token, method = 'GET', body, status = 200 } = {}) {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${api}${path}`, { method, headers, body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined });
  if (response.status === 204) { assert.equal(status, 204); return; }
  const value = await response.json();
  assert.equal(response.status, status, `${method} ${path}: ${value.message || response.status}`);
  return value.data ?? value;
}
async function waitUntil(run, predicate, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await run();
    if (predicate(value)) return value;
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  throw new Error('State did not converge within timeout');
}
function observe(page) {
  page.on('pageerror', error => issues.push(error.message));
  page.on('dialog', async dialog => { issues.push(`Native dialog: ${dialog.type()}`); await dialog.dismiss(); });
}
async function auditPage(page, name, { admin = false } = {}) {
  const problems = await page.evaluate(({ admin }) => {
    const visible = el => el.getClientRects().length > 0 && !el.closest('[inert]') && getComputedStyle(el).visibility !== 'hidden';
    const problems = [];
    if (document.documentElement.scrollWidth > innerWidth + 1) problems.push('horizontal overflow');
    if (admin && document.documentElement.scrollHeight > innerHeight + 1) problems.push('admin vertical overflow');
    for (const input of document.querySelectorAll('input:not([type="hidden"]),select,textarea')) {
      if (visible(input) && !input.labels?.length && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) problems.push(`unlabelled ${input.tagName} (${input.placeholder || input.type})`);
    }
    for (const button of document.querySelectorAll('button')) {
      if (visible(button) && !button.textContent.trim() && !button.getAttribute('aria-label') && !button.getAttribute('aria-labelledby')) problems.push('unnamed button');
    }
    return problems;
  }, { admin });
  issues.push(...problems.map(problem => `${name}: ${problem}`));
}
const config = await readFile(new URL('../backend/config.yaml', import.meta.url), 'utf8');
const stripeBlock = config.match(/^stripe:\s*\r?\n([\s\S]*?)(?=^\S|$(?![\s\S]))/m)?.[1] || '';
const configValue = key => stripeBlock.match(new RegExp(`^\\s+${key}:\\s*["']?([^\\s"']+)`, 'm'))?.[1];
const stripeKey = configValue('secret_key');
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || configValue('webhook_secret');
async function stripe(path) {
  assert(stripeKey?.startsWith('sk_test_'), 'Stripe test key must be configured');
  const response = await fetch(`https://api.stripe.com/v1${path}`, { headers: { Authorization: `Bearer ${stripeKey}` } });
  const value = await response.json();
  assert(response.ok, value.error?.message || 'Stripe request failed');
  return value;
}
async function completeCheckout(page, email) {
  await page.locator('#email').fill(email);
  if (!(await page.locator('#cardNumber').isVisible())) {
    // Stripe's expanded hit area overlays a zero-size accordion button.
    // Click the visible card label as a user would, without changing its DOM.
    const box = await page.locator('#payment-method-label-card').boundingBox();
    assert(box, 'Card payment option must be visible');
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }
  await page.locator('#cardNumber').fill('4242424242424242');
  await page.locator('#cardExpiry').fill('1230');
  await page.locator('#cardCvc').fill('123');
  await page.locator('#billingName').fill('Acceptance Member');
  const postal = page.locator('#billingPostalCode');
  if (await postal.isVisible()) await postal.fill('10110');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`${origin}/payments/success**`, { timeout: 60000, waitUntil: 'domcontentloaded' });
}
async function relayCompletedEvent(sessionId) {
  const events = await stripe('/events?type=checkout.session.completed&limit=100');
  const event = events.data.find(event => event.data.object.id === sessionId);
  assert(event, 'Completed event must exist in Stripe');
  const payload = JSON.stringify(event); const timestamp = Math.floor(Date.now() / 1000);
  const signature = createHmac('sha256', webhookSecret).update(`${timestamp}.${payload}`).digest('hex');
  for (let i = 0; i < 2; i++) {
    const response = await fetch(`${api}/payments/stripe/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${timestamp},v1=${signature}` }, body: payload });
    assert.equal(response.status, 200);
  }
  const invalid = await fetch(`${api}/payments/stripe/webhook`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${timestamp},v1=invalid` }, body: payload });
  assert.equal(invalid.status, 400);
}
let browser, customerPage;
try {
  browser = await chromium.launch({ channel: 'chrome', headless: true });
  const customer = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await customer.newPage(); customerPage = page; observe(page);
  await check('empty catalog API and public desktop pages', async () => {
    assert.equal((await request('/products')).length, 0, 'Use a fresh isolated DB');
    for (const path of ['/', '/keyboard', '/keycaps', '/switches', '/accessories', '/search?q=missing']) {
      await page.goto(`${origin}${path}`); await page.waitForLoadState('networkidle');
      await auditPage(page, `empty ${path}`);
    }
  });
  const email = `acceptance-${Date.now()}@example.com`;
  await check('customer registration and member redirect', async () => {
    await page.goto(`${origin}/register`);
    await page.locator('input[autocomplete="name"]').fill('Acceptance Member');
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').nth(0).fill('test1234');
    await page.locator('input[type="password"]').nth(1).fill('test1234');
    await auditPage(page, 'register');
    await page.getByRole('button', { name: 'สมัครสมาชิก', exact: true }).click();
    await page.waitForURL('**/profile'); await page.waitForLoadState('networkidle');
  });
  const memberToken = await page.evaluate(() => JSON.parse(localStorage.getItem('keywerk-auth')).state.token);
  const adminLogin = await request('/login', { method: 'POST', body: { email: 'admin@gmail.com', password: '1234' } });
  const adminToken = adminLogin.token;
  const adminContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await adminContext.addInitScript(({ token }) => localStorage.setItem('keywerk-auth', JSON.stringify({ state: { token, email: 'admin@gmail.com' }, version: 0 })), { token: adminToken });
  const adminPage = await adminContext.newPage(); observe(adminPage);
  await check('empty member and admin pages in both themes', async () => {
    for (const [activePage, paths] of [[page, ['/profile', '/addresses', '/orders', '/cart', '/checkout']], [adminPage, ['/admin', '/admin/products', '/admin/product-variants', '/admin/brands', '/admin/categories', '/admin/orders', '/admin/payments']]]) {
      for (const path of paths) {
        await activePage.goto(`${origin}${path}`); await activePage.waitForLoadState('networkidle');
        for (const theme of ['light', 'dark']) {
          await activePage.evaluate(theme => { localStorage.setItem('keywerk-theme', theme); document.documentElement.dataset.theme = theme; }, theme);
          await auditPage(activePage, `${path} ${theme}`, { admin: path.startsWith('/admin') });
        }
      }
    }
    await page.goto(`${origin}/profile`); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'เปลี่ยนเป็นธีมสว่าง' }).click();
    assert.equal(await page.locator('html').getAttribute('data-theme'), 'light');
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.kw-profile-actions > a')).backgroundColor === getComputedStyle(document.body).backgroundColor);
    const colors = await page.locator('.kw-profile-actions > a').first().evaluate(el => ({ bg: getComputedStyle(el).backgroundColor, expected: getComputedStyle(document.body).backgroundColor }));
    assert.equal(colors.bg, colors.expected, 'Profile action must follow light theme');
    await page.screenshot({ path: `${artifacts}/profile-light.png`, fullPage: true });
    await page.getByRole('button', { name: 'เปลี่ยนเป็นธีมมืด' }).click();
    await page.screenshot({ path: `${artifacts}/profile-dark.png`, fullPage: true });
  });
  const categories = await request('/categories');
  const category = categories.find(item => /mechanical/i.test(item.category_name)) || categories[0];
  const marker = `Acceptance ${Date.now()}`;
  const imageFile = await readFile(new URL('../frontend/src/assets/KEYWERK_Preview.png', import.meta.url));
  let variant, product;
  await check('admin catalog CRUD and real SeaweedFS product upload', async () => {
    await request('/brands', { token: adminToken, method: 'POST', body: { brand_name: marker }, status: 201 });
    const brand = (await request('/brands')).find(item => item.brand_name === marker);
    await request('/products', { token: adminToken, method: 'POST', body: { brand_id: brand.brand_id, category_id: category.category_id, product_name: marker, description: 'Isolated acceptance fixture' }, status: 201 });
    product = (await request('/products')).find(item => item.product_name === marker);
    const files = new FormData(); files.append('images', new Blob([imageFile], { type: 'image/png' }), 'acceptance.png');
    const images = await request('/upload', { token: adminToken, method: 'POST', body: files });
    assert(images[0].image_url.includes('/products/'));
    assert((await fetch(`http://127.0.0.1:8888/buckets${images[0].image_url}`)).ok, 'Uploaded product image must be readable through the filer');
    await request('/product-variants', { token: adminToken, method: 'POST', body: { product_id: product.product_id, image_id: images[0].image_id, variant_name: 'Black / Silent Red', stock: 12, price: 1990, attributes: { color: 'Black', switch: 'Silent Red' } }, status: 201 });
    variant = (await request(`/product-variants/product/${product.product_id}`))[0];
    const otherCategory = categories.find(item => item.category_id !== category.category_id);
    assert.equal((await request(`/products?category_id=${otherCategory.category_id}`)).length, 0);
    await request(`/products/${product.product_id}`, { token: adminToken, method: 'PUT', body: { description: 'Verified catalog edit' } });
    assert.equal((await request(`/products/${product.product_id}`)).description, 'Verified catalog edit');
    await request('/products', { token: adminToken, method: 'POST', body: { brand_id: brand.brand_id, category_id: category.category_id, product_name: `${marker} delete fixture` }, status: 201 });
    const spare = (await request('/products')).find(item => item.product_name === `${marker} delete fixture`);
    await request('/product-variants', { token: adminToken, method: 'POST', body: { product_id: spare.product_id, variant_name: 'Disposable SKU', stock: 1, price: 100 }, status: 201 });
    const spareVariant = (await request(`/product-variants/product/${spare.product_id}`))[0];
    await request(`/product-variants/${spareVariant.variant_id}`, { token: adminToken, method: 'PUT', body: { stock: 2 } });
    assert.equal((await request(`/product-variants/${spareVariant.variant_id}`)).stock, 2);
    await request(`/product-variants/${spareVariant.variant_id}`, { token: adminToken, method: 'DELETE', status: 204 });
    await request(`/products/${spare.product_id}`, { token: adminToken, method: 'DELETE', status: 204 });
    await request(`/products/${spare.product_id}`, { status: 404 });
  });
  await check('profile upload uses profiles bucket and image loads in browser', async () => {
    await page.goto(`${origin}/profile`); await page.waitForLoadState('networkidle');
    await page.getByLabel('รูปโปรไฟล์', { exact: true }).setInputFiles({ name: 'profile.png', mimeType: 'image/png', buffer: imageFile });
    const profile = await waitUntil(() => request('/profile', { token: memberToken }), profile => profile.image?.includes('/profiles/'));
    assert((await fetch(`http://127.0.0.1:8888/buckets${profile.image}`)).ok);
    await page.locator('img[alt="รูปโปรไฟล์"]').waitFor();
    await page.waitForFunction(() => document.querySelector('img[alt="รูปโปรไฟล์"]')?.naturalWidth > 0);
  });
  await check('admin forms have labels, keyboard modal behavior and image preview', async () => {
    for (const [path, button] of [['/admin/products', '+ เพิ่มสินค้า'], ['/admin/brands', '+ เพิ่มแบรนด์'], ['/admin/categories', '+ เพิ่มหมวดหมู่'], ['/admin/product-variants', '+ เพิ่ม variant']]) {
      await adminPage.goto(`${origin}${path}`); await adminPage.waitForLoadState('networkidle');
      await adminPage.getByRole('button', { name: button, exact: true }).click();
      await adminPage.getByRole('dialog').waitFor();
      await auditPage(adminPage, `${path} form`);
      await adminPage.keyboard.press('Tab');
      assert(await adminPage.evaluate(() => Boolean(document.activeElement.closest('dialog'))), 'Modal must keep keyboard focus');
      if (path.endsWith('/product-variants')) {
        await adminPage.getByLabel('รูปสินค้า', { exact: true }).setInputFiles({ name: 'preview.png', mimeType: 'image/png', buffer: imageFile });
        await adminPage.getByRole('dialog').locator('img[alt="preview"]').waitFor();
        await adminPage.getByRole('button', { name: 'เปลี่ยนรูป', exact: true }).waitFor();
      }
      await adminPage.keyboard.press('Escape');
      assert.equal(await adminPage.getByRole('dialog').count(), 0);
    }
  });
  await check('populated admin pagination fits desktop viewport', async () => {
    for (let i = 0; i < 24; i++) await request('/brands', { token: adminToken, method: 'POST', body: { brand_name: `${marker} page ${i}` }, status: 201 });
    for (const viewport of [{ width: 1280, height: 800 }, { width: 1440, height: 900 }, { width: 1920, height: 1080 }]) {
      await adminPage.setViewportSize(viewport);
      await adminPage.goto(`${origin}/admin/brands`); await adminPage.waitForLoadState('networkidle');
      await auditPage(adminPage, `admin brands ${viewport.width}`, { admin: true });
      const firstRows = await adminPage.locator('tbody tr').allTextContents();
      assert(firstRows.length > 0 && firstRows.length < 25);
      await adminPage.getByRole('button', { name: 'หน้าถัดไป', exact: true }).click();
      const secondRows = await adminPage.locator('tbody tr').allTextContents();
      assert(secondRows.every(row => !firstRows.includes(row)));
      await adminPage.screenshot({ path: `${artifacts}/admin-brands-${viewport.width}.png` });
    }
    await adminPage.setViewportSize({ width: 1440, height: 900 });
  });
  let cancelledOrder;
  await check('customer cancellation restores stock once and protects ownership', async () => {
    const inline = { receiver_name: 'Acceptance Member', phone_number: '0812345678', address_line1: '1 Test Road', district: 'Test', province: 'Bangkok', postal_code: '10110' };
    cancelledOrder = await request('/orders', { token: memberToken, method: 'POST', body: { ...inline, items: [{ variant_id: variant.variant_id, quantity: 2 }] }, status: 201 });
    assert.equal((await request(`/product-variants/${variant.variant_id}`)).stock, 10);
    await request(`/orders/${cancelledOrder.order_id}/cancel`, { token: adminToken, method: 'POST', status: 403 });
    await page.goto(`${origin}/orders/${cancelledOrder.order_id}`); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'ยกเลิกคำสั่งซื้อ', exact: true }).click();
    await page.getByRole('button', { name: 'ยืนยันการยกเลิก', exact: true }).click();
    await waitUntil(() => request(`/orders/${cancelledOrder.order_id}`, { token: memberToken }), order => order.status === 'cancelled');
    await request(`/orders/${cancelledOrder.order_id}/cancel`, { token: memberToken, method: 'POST', status: 409 });
    const restored = await request(`/product-variants/${variant.variant_id}`);
    assert.equal(restored.stock, 12); assert.equal(restored.sold_count, 0);
  });
  let paidOrder;
  await check('customer product to cart, address, checkout, stock and cart clearing', async () => {
    await page.goto(`${origin}/product/${product.product_id}`); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: /เพิ่มลงตะกร้า/ }).click();
    await waitUntil(() => request('/cart', { token: memberToken }), cart => cart.items.length === 1);
    await page.getByRole('button', { name: 'ตะกร้าสินค้า', exact: true }).click();
    await page.waitForURL('**/cart');
    await page.locator('article').getByText(marker, { exact: true }).waitFor();
    await page.goto(`${origin}/addresses`); await page.waitForLoadState('networkidle');
    for (const [label, value] of [['ชื่อที่อยู่', 'Acceptance Home'], ['ชื่อผู้รับ', 'Acceptance Member'], ['เบอร์โทรศัพท์', '0812345678'], ['ที่อยู่', '1 Test Road'], ['เขต / อำเภอ', 'Test'], ['จังหวัด', 'Bangkok'], ['รหัสไปรษณีย์', '10110']]) await page.getByRole('textbox', { name: `${label} *`, exact: true }).fill(value);
    await page.getByRole('button', { name: 'บันทึกที่อยู่' }).click();
    await waitUntil(() => request('/addresses', { token: memberToken }), addresses => addresses.length === 1);
    await page.goto(`${origin}/checkout?variant=${variant.variant_id}&quantity=1`); await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'ยืนยันคำสั่งซื้อ', exact: true }).click();
    await page.waitForURL(/\/orders\/[\w-]+$/);
    const directId = new URL(page.url()).pathname.split('/').pop();
    assert.equal((await request('/cart', { token: memberToken })).items.length, 1, 'Direct buy must retain cart');
    await request(`/orders/${directId}/cancel`, { token: memberToken, method: 'POST' });
    assert.equal((await request(`/product-variants/${variant.variant_id}`)).stock, 12);
    await page.goto(`${origin}/cart`); await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'ดำเนินการสั่งซื้อ' }).click();
    await page.getByRole('button', { name: 'ยืนยันคำสั่งซื้อ', exact: true }).click();
    await page.waitForURL(/\/orders\/[\w-]+$/);
    const id = new URL(page.url()).pathname.split('/').pop();
    paidOrder = await request(`/orders/${id}`, { token: memberToken });
    assert.equal(paidOrder.total_price, 1990);
    assert.equal((await request('/cart', { token: memberToken })).items.length, 0);
    assert.equal((await request(`/product-variants/${variant.variant_id}`)).stock, 11);
  });
  if (process.env.VERIFY_STRIPE === '1') {
    await check('real Stripe test checkout and server-side reconciliation', async () => {
      await page.getByRole('button', { name: 'ชำระเงินผ่าน Stripe', exact: true }).click();
      await page.waitForURL('https://checkout.stripe.com/**', { timeout: 45000, waitUntil: 'domcontentloaded' });
      await request(`/orders/${paidOrder.order_id}/cancel`, { token: memberToken, method: 'POST', status: 409 });
      await completeCheckout(page, email);
      await waitUntil(() => request(`/orders/${paidOrder.order_id}`, { token: memberToken }), order => order.payment?.status === 'paid' && order.status === 'processing', 45000);
    });
    await check('signed real Stripe event webhook is idempotent', async () => {
      const order = await request(`/orders/${paidOrder.order_id}`, { token: memberToken });
      await relayCompletedEvent(order.payment.provider_session_id);
      assert.equal((await request(`/product-variants/${variant.variant_id}`)).stock, 11);
      await request(`/orders/${paidOrder.order_id}/cancel`, { token: memberToken, method: 'POST', status: 409 });
    });
    await check('webhook alone moves pending payment/order to paid/processing', async () => {
      const address = (await request('/addresses', { token: memberToken }))[0];
      const webhookOrder = await request('/orders', { token: memberToken, method: 'POST', body: { address_id: address.address_id, items: [{ variant_id: variant.variant_id, quantity: 1 }] }, status: 201 });
      const payment = await request('/payments', { token: memberToken, method: 'POST', body: { order_id: webhookOrder.order_id }, status: 201 });
      await page.route('**/payments/order/*/reconcile', route => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Reconciliation intentionally disabled for webhook-only proof' }) }));
      await page.goto(payment.checkout_url); await completeCheckout(page, email);
      assert.equal((await request(`/orders/${webhookOrder.order_id}`, { token: memberToken })).payment.status, 'pending');
      await relayCompletedEvent(payment.provider_session_id);
      const verified = await request(`/orders/${webhookOrder.order_id}`, { token: memberToken });
      assert.equal(verified.payment.status, 'paid'); assert.equal(verified.status, 'processing');
      await page.unroute('**/payments/order/*/reconcile');
    });
    await check('admin tracking to shipped is visible to customer', async () => {
      await adminPage.goto(`${origin}/admin/orders`); await adminPage.waitForLoadState('networkidle');
      const row = adminPage.locator('tr').filter({ hasText: paidOrder.order_id.slice(0, 8) });
      await row.getByRole('button', { name: 'เพิ่มเลขติดตาม' }).click();
      await adminPage.getByLabel('เลขติดตามพัสดุ', { exact: true }).fill('TH-ACCEPTANCE-001');
      await adminPage.getByRole('button', { name: 'บันทึกและจัดส่ง', exact: true }).click();
      await waitUntil(() => request(`/orders/${paidOrder.order_id}`, { token: memberToken }), order => order.status === 'shipped' && order.tracking_number === 'TH-ACCEPTANCE-001');
      await page.goto(`${origin}/orders/${paidOrder.order_id}`); await page.getByText('เลขติดตาม: TH-ACCEPTANCE-001').waitFor();
    });
  } else results.push({ name: 'Stripe checkout/webhook/tracking', status: 'unavailable', reason: 'Set VERIFY_STRIPE=1 to exercise real test-mode Stripe' });
  await check('desktop accessibility, overflow and native dialogs', async () => {
    assert.deepEqual(issues, [], issues.join('\n'));
  });
} catch (error) {
  await customerPage?.screenshot({ path: `${artifacts}/failure.png`, fullPage: true }).catch(() => {});
  console.error(redact(error.message)); process.exitCode = 1;
} finally {
  await browser?.close();
  await writeFile(`${artifacts}/results.json`, JSON.stringify({ checkedAt: new Date().toISOString(), results, issues }, null, 2));
}
