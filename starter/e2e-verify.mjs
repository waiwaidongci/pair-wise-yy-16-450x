#!/usr/bin/env node
/**
 * e2e-verify.mjs —— 浏览器实测脚本（task.md「验证要求」）
 *
 * 覆盖 7 条约束的关键交互：
 *   1) 筛选状态跨导航保持（/work → 系列页 → 后退）
 *   2) 灯箱翻页只在当前筛选子集内循环 + 计数器 x / N
 *   3) 图片加载前容器宽高比与 photos.json 一致（slow-3g 风格延迟）
 *   4) 系列页顺序由 photos.json 按 order 派生
 *   5) 390px 移动端单列 + 灯箱说明落到图片下方 + 汉堡菜单
 *   6) 无 fonts.googleapis.com / gstatic.com 请求，字体来自本地 woff2
 *   7) 联系表单：空值禁用提交、非法邮箱行内报错、成功态
 *
 * 用法：
 *   cd starter
 *   npm install
 *   node e2e-verify.mjs
 *
 * 需要可用的 Playwright Chromium（脚本会在缺失时提示安装命令）。
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 5210)
const BASE = `http://127.0.0.1:${PORT}`
const DATA = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'src', 'data', 'photos.json'), 'utf8'),
)

let chromium
try {
  ;({ chromium } = await import('playwright'))
} catch {
  console.error('未找到 playwright。请先执行：npm i -D playwright && npx playwright install chromium')
  process.exit(2)
}

const results = []
function check(name, fn) {
  return { name, fn }
}

async function run() {
  const server = spawn('npx', ['vite', '--port', String(PORT), '--host', '127.0.0.1', '--strictPort'], {
    cwd: __dirname,
    stdio: 'ignore',
    shell: process.platform === 'win32',
  })

  const browser = await chromium.launch()
  let failed = 0

  try {
    const warmup = await browser.newPage()
    await waitForServer(warmup)
    await warmup.close().catch(() => {})
    const checks = [
      check('约束1 筛选状态跨导航保持', async (page) => {
        await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
        await page.getByRole('button', { name: '牧野' }).click()
        assert(await page.locator('.photo-button').count() === 4, '牧野筛选应有 4 张')
        await page.getByRole('link', { name: /高原牧歌/ }).first().click()
        await page.waitForURL(/highland-pastoral/)
        await page.goBack()
        await page.waitForURL(/\/work$/)
        const pressed = await page.getByRole('button', { name: '牧野' }).getAttribute('aria-pressed')
        assert(pressed === 'true', '返回后「牧野」仍为选中态')
        assert(await page.locator('.photo-button').count() === 4, '返回后仍为 4 张牧野')
      }),

      check('约束2 灯箱只在筛选子集内循环（x / 4）', async (page) => {
        await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
        await page.getByRole('button', { name: '牧野' }).click()
        await page.locator('.photo-button').first().click()
        await expectVisible(page, '.lightbox[role="dialog"]')
        const c0 = await counter(page)
        assert(c0.total === 4 && c0.index === 1, `计数器应为 1/4，实际 ${c0.index}/${c0.total}`)
        const titles = [await lightboxTitle(page)]
        for (let i = 0; i < 4; i++) {
          await page.getByRole('button', { name: '下一张' }).click()
          titles.push(await lightboxTitle(page))
        }
        const expected = DATA.photos.filter((p) => p.category === 'pastoral').map((p) => p.title)
        assert(JSON.stringify(titles.slice(0, 4).sort()) === JSON.stringify([...expected].sort()), '4 张标题恰为牧野集合')
        assert(titles[4] === titles[0], '第 5 次应循环回第 1 张')
        assert((await counter(page)).total === 4, '循环后 total 仍为 4')
        await page.getByRole('button', { name: '关闭' }).click()
      }),

      check('约束3 延迟加载下容器比例正确、加载后无位移', async (page) => {
        await page.route('**/*.jpg', async (route) => {
          await new Promise((r) => setTimeout(r, 900))
          try {
            await route.continue()
          } catch {
            // 导航中断时同一路由可能已被处理，忽略
          }
        })
        await page.goto(`${BASE}/work`, { waitUntil: 'domcontentloaded' })
        const first = DATA.photos[0]
        const box = await page.locator('.photo-button .ratio-box').first().boundingBox()
        const ratioErr = Math.abs(box.width / box.height - first.width / first.height) / (first.width / first.height)
        assert(ratioErr < 0.01, `比例误差 ${(ratioErr * 100).toFixed(2)}% 应 <1%`)
        const before = await page.locator('.photo-button').nth(1).boundingBox()
        await page.unroute('**/*.jpg').catch(() => {})
        await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
        const after = await page.locator('.photo-button').nth(1).boundingBox()
        assert(Math.abs(before.y - after.y) < 1, '加载完成后相邻元素位移 <1px')
      }),

      check('约束4 系列页顺序 = photos.json 按 order 派生', async (page) => {
        const expected = DATA.photos.filter((p) => p.seriesId === 'highland-pastoral').sort((a, b) => a.order - b.order)
        await page.goto(`${BASE}/work/highland-pastoral`, { waitUntil: 'networkidle' })
        const rendered = await page.locator('.story article h2').allTextContents()
        assert(JSON.stringify(rendered) === JSON.stringify(expected.map((p) => p.title)), '系列页顺序一致')
      }),

      check('约束5 390px 单列 + 灯箱底部信息条 + 汉堡菜单', async (page) => {
        await page.setViewportSize({ width: 390, height: 844 })
        await page.goto(`${BASE}/work`, { waitUntil: 'networkidle' })
        const a = await page.locator('.photo-button').first().boundingBox()
        const b = await page.locator('.photo-button').nth(1).boundingBox()
        assert(b.y > a.y + a.height - 2, '移动端为单列排布')
        await expectVisible(page, '.menu')
        await page.locator('.photo-button').first().click()
        const img = await page.locator('.lightbox-image').boundingBox()
        const info = await page.locator('.lightbox-info').boundingBox()
        assert(info.y >= img.y + img.height - 2, '灯箱说明位于图片下方')
        await page.getByRole('button', { name: '关闭' }).click()
      }),

      check('约束6 无外部字体 CDN 请求', async (page) => {
        const urls = []
        page.on('request', (r) => urls.push(r.url()))
        for (const r of ['/', '/work', '/about', '/contact']) {
          await page.goto(BASE + r, { waitUntil: 'networkidle' })
        }
        const bad = urls.filter((u) => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(u))
        assert(bad.length === 0, `发现外部字体请求：${bad.join(', ')}`)
        const local = new Set(urls.filter((u) => u.includes('/fonts/') && u.endsWith('.woff2')))
        assert(local.size >= 2, `本地 woff2 请求应 ≥2，实际 ${local.size}`)
      }),

      check('约束7 联系表单校验与成功态', async (page) => {
        await page.goto(`${BASE}/contact`, { waitUntil: 'networkidle' })
        const submit = page.getByRole('button', { name: '发送消息' })
        assert(await submit.isDisabled(), '空表单提交按钮应禁用')
        await page.getByLabel('邮箱').fill('bad')
        await page.getByLabel('邮箱').blur()
        await expectVisible(page, 'text=请输入有效的邮箱地址')
        await page.getByLabel('姓名').fill('访客')
        await page.getByLabel('邮箱').fill('hello@example.com')
        await page.getByLabel('留言').fill('想了解一项完整的摄影合作计划，谢谢。')
        assert(await submit.isEnabled(), '合法内容应允许提交')
        await submit.click()
        await expectVisible(page, 'text=谢谢你的来信')
      }),
    ]

    for (const c of checks) {
      // 每个用例独立上下文：筛选状态、网络拦截互不污染（与 Playwright 套件一致）
      const page = await browser.newPage()
      try {
        await c.fn(page)
        results.push({ name: c.name, ok: true })
        console.log(`  ✅ ${c.name}`)
      } catch (err) {
        failed++
        results.push({ name: c.name, ok: false, error: err.message })
        console.log(`  ❌ ${c.name}\n     ${err.message}`)
      } finally {
        await page.close().catch(() => {})
      }
    }
  } finally {
    await browser.close().catch(() => {})
    server.kill()
  }

  console.log(`\n${results.length - failed}/${results.length} 项通过`)
  process.exit(failed ? 1 : 0)
}

async function waitForServer(page) {
  const deadline = Date.now() + 30_000
  for (;;) {
    try {
      await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 2000 })
      return
    } catch {
      if (Date.now() > deadline) throw new Error('Vite dev server 启动超时')
      await new Promise((r) => setTimeout(r, 500))
    }
  }
}

async function expectVisible(p, sel) {
  await p.locator(sel).first().waitFor({ state: 'visible', timeout: 5000 })
}

async function counter(p) {
  const text = (await p.locator('.lightbox-info .eyebrow').textContent()) || ''
  const m = text.match(/(\d+)\s*\/\s*(\d+)/)
  if (!m) throw new Error(`无法解析计数器：${text}`)
  return { index: Number(m[1]), total: Number(m[2]) }
}

async function lightboxTitle(p) {
  return ((await p.locator('.lightbox-info h2').textContent()) || '').trim()
}

function assert(cond, message) {
  if (!cond) throw new Error(message)
}

run().catch((err) => {
  console.error(err)
  process.exit(2)
})
