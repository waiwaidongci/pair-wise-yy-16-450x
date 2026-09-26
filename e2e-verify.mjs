// Browser verification for the 7 coupled constraints in task.md.
// Run with the dev server up (npm run dev):  node e2e-verify.mjs
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:5173'
const SHOTS = new URL('./verify-shots/', import.meta.url).pathname
mkdirSync(SHOTS, { recursive: true })

let failures = 0
const ok = (name, cond, extra = '') => {
  const mark = cond ? 'PASS' : 'FAIL'
  if (!cond) failures++
  console.log(`[${mark}] ${name}${extra ? ` — ${extra}` : ''}`)
}

const browser = await chromium.launch()

async function newPage(viewport = { width: 1440, height: 1000 }) {
  const page = await browser.newPage({ viewport })
  const errors = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  page.on('pageerror', err => errors.push(String(err)))
  return { page, errors }
}

// ---------- 1. routes render, no console errors, filter UI -------------------
{
  const { page, errors } = await newPage()
  for (const route of ['/', '/work', '/work/highland-pastoral', '/about', '/contact']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
    ok(`route ${route} renders <main>`, await page.locator('main').isVisible())
  }
  ok('no console errors across routes', errors.length === 0, errors.join(' | '))

  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  const labels = await page.locator('.filters button').allTextContents()
  ok('filter labels are 全部/肖像/风光/牧野', JSON.stringify(labels) === JSON.stringify(['全部', '肖像', '风光', '牧野']), labels.join(','))
  await page.close()
}

// ---------- 2. filter persistence across navigation --------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '牧野' }).click()
  ok('pastoral filter shows 4 photos', (await page.locator('.photo-button').count()) === 4)

  await page.getByRole('link', { name: /高原牧歌/ }).click()
  await page.waitForURL(/highland-pastoral/)
  await page.goBack()
  await page.waitForURL(/\/work$/)

  const pressed = await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')
  ok('filter still 牧野 after series detour + back', pressed === 'true')
  ok('grid still shows 4 photos after back', (await page.locator('.photo-button').count()) === 4)
  await page.close()
}

// ---------- 3. lightbox scoped navigation ------------------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '牧野' }).click()
  await page.locator('.photo-button').nth(1).click()
  await page.locator('.lightbox[role="dialog"]').waitFor()

  const counter = async () => (await page.locator('.lightbox-info .eyebrow').textContent()) ?? ''
  const title = async () => ((await page.locator('.lightbox-info h2').textContent()) ?? '').trim()

  ok('lightbox opens at 2 / 4', /2\s*\/\s*4/.test(await counter()), await counter())
  await page.screenshot({ path: `${SHOTS}/state-c1-lightbox-before-next.png` })

  const seen = [await title()]
  for (let i = 0; i < 4; i++) {
    await page.getByRole('button', { name: '下一张' }).click()
    seen.push(await title())
    if (i === 0) await page.screenshot({ path: `${SHOTS}/state-c2-lightbox-after-next.png` })
  }
  ok('4 nexts cycle back to start within pastoral set', seen[4] === seen[0], seen.join(' → '))
  ok('all 4 distinct pastoral titles seen', new Set(seen.slice(0, 4)).size === 4)
  ok('counter total stays 4', /\/\s*4/.test(await counter()), await counter())

  await page.getByRole('button', { name: '上一张' }).click()
  ok('prev wraps within the same set', (await title()) === seen[3], `${await title()} vs ${seen[3]}`)
  await page.getByRole('button', { name: '关闭' }).click()
  ok('lightbox closes', (await page.locator('.lightbox[role="dialog"]').count()) === 0)
  await page.close()
}

// ---------- 4. shared lightbox from 3 entries --------------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await page.locator('.photo-button').first().click()
  ok('lightbox from /work grid', await page.locator('.lightbox[role="dialog"]').isVisible())
  await page.getByRole('button', { name: '关闭' }).click()

  await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
  await page.locator('.story .photo-button').first().click()
  ok('lightbox from series story', await page.locator('.lightbox[role="dialog"]').isVisible())
  await page.getByRole('button', { name: '关闭' }).click()

  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.locator('.series-card').first().click()
  ok('lightbox from home series card', await page.locator('.lightbox[role="dialog"]').isVisible())
  await page.close()
}

// ---------- 5. CLS-safe image loading ----------------------------------------
{
  const { page } = await newPage()
  await page.route('**/*.jpg', async route => {
    await new Promise(r => setTimeout(r, 900))
    await route.continue()
  })
  await page.goto(`${BASE}/work`, { waitUntil: 'domcontentloaded' })

  const firstBox = await page.locator('.photo-button .ratio-box').first().boundingBox()
  // portrait-01: 4067 x 6000
  const expected = 4067 / 6000
  const actual = firstBox.width / firstBox.height
  ok('ratio-box reserves aspect ratio before load', Math.abs(actual - expected) < 0.01, `${actual.toFixed(4)} vs ${expected.toFixed(4)}`)

  const before = await page.locator('.photo-button').nth(1).boundingBox()
  await page.waitForLoadState('networkidle')
  const after = await page.locator('.photo-button').nth(1).boundingBox()
  ok('no layout shift after images load', Math.abs(before.y - after.y) < 1, `dy=${Math.abs(before.y - after.y).toFixed(2)}px`)
  await page.unroute('**/*.jpg')
  await page.close()
}

// ---------- 6. series page shared data model ---------------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
  const titles = await page.locator('.story article h2').allTextContents()
  ok(
    'series page renders photos in order',
    JSON.stringify(titles) === JSON.stringify(['独牛与木屋', '坡地牛群', '雪山下的歇息', '新疆牧场']),
    titles.join(','),
  )
  const quote = await page.locator('.pull-quote').textContent()
  ok('pull-quote shows series summary', quote.includes('牧场、牛群与人在高原上的共生关系'))
  const caption = await page.locator('.story article .story-caption').first().textContent()
  ok('real caption rendered', caption.includes('木屋比牛安静'))
  await page.close()
}

// ---------- 7. mobile responsive ---------------------------------------------
{
  const { page } = await newPage({ width: 390, height: 844 })
  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })

  const first = await page.locator('.photo-button').first().boundingBox()
  const second = await page.locator('.photo-button').nth(1).boundingBox()
  ok('mobile grid is single column', second.y > first.y + first.height - 2, `y2=${second.y} y1+h=${first.y + first.height}`)
  ok('hamburger menu visible on mobile', await page.locator('.menu').isVisible())
  await page.screenshot({ path: `${SHOTS}/state-e-mobile-grid.png` })

  await page.locator('.photo-button').first().click()
  await page.locator('.lightbox[role="dialog"]').waitFor()
  const imgBox = await page.locator('.lightbox-image').boundingBox()
  const infoBox = await page.locator('.lightbox-info').boundingBox()
  ok('mobile lightbox info below image', infoBox.y >= imgBox.y + imgBox.height - 2, `info.y=${infoBox.y} img.bottom=${imgBox.y + imgBox.height}`)
  await page.screenshot({ path: `${SHOTS}/state-e-mobile-work.png` })
  await page.getByRole('button', { name: '关闭' }).click()
  await page.close()
}

// ---------- 8. offline fonts ---------------------------------------------------
{
  const { page } = await newPage()
  const requests = []
  page.on('request', req => requests.push(req.url()))
  for (const route of ['/', '/work', '/about', '/contact']) {
    await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
  }
  const external = requests.filter(u => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u))
  ok('no external font CDN requests', external.length === 0, external.join(','))
  const localFonts = new Set(requests.filter(u => u.includes('/fonts/') && u.endsWith('.woff2')))
  ok('local woff2 fonts loaded (>=2)', localFonts.size >= 2, [...localFonts].map(u => u.split('/').pop()).join(','))
  const noReference = requests.filter(u => /reference_/.test(u))
  ok('no reference_*.png requested', noReference.length === 0)
  await page.close()
}

// ---------- 9. contact form states ---------------------------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
  const submit = page.getByRole('button', { name: '发送消息' })
  ok('submit disabled when empty', await submit.isDisabled())

  await page.getByLabel('姓名').click()
  await page.getByLabel('邮箱').click()
  ok('inline error for empty name after blur', await page.getByText('请输入姓名').isVisible())

  await page.getByLabel('邮箱').fill('bad')
  await page.getByLabel('邮箱').blur()
  ok('inline error for invalid email', await page.getByText('请输入有效的邮箱地址').isVisible())
  ok('submit still disabled with invalid email', await submit.isDisabled())
  await page.screenshot({ path: `${SHOTS}/state-f1-form-errors.png` })

  await page.getByLabel('姓名').fill('访客')
  await page.getByLabel('邮箱').fill('hello@example.com')
  await page.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
  ok('submit enabled when valid', await submit.isEnabled())
  await submit.click()
  await page.getByText('谢谢你的来信').waitFor()
  ok('success state replaces form', await page.getByText('谢谢你的来信').isVisible())
  ok('form no longer present after success', (await page.locator('form.contact-form').count()) === 0)
  await page.screenshot({ path: `${SHOTS}/state-f2-form-success.png` })
  await page.close()
}

// ---------- 10. visual state screenshots ---------------------------------------
{
  const { page } = await newPage()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${SHOTS}/state-a-home.png` })

  await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: '牧野' }).click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOTS}/state-b-work-filtered.png` })

  await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${SHOTS}/state-d-series.png`, fullPage: true })

  await page.goto(`${BASE}/about`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${SHOTS}/state-about.png` })
  await page.close()
}

await browser.close()
console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
