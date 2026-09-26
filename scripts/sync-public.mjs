// Copies runtime assets (real photos + self-hosted fonts) from the task-provided
// directories into public/ so Vite can serve them. mock-data/ and assets/ are
// read-only sources; this script never writes back into them. If a source is
// unavailable (e.g. the project was copied without its sibling data dirs), the
// previously synced files under public/ remain in place and the build proceeds.
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(root, '..')

const jobs = [
  ['mock-data/photos', 'public/photos'],
  ['assets/fonts', 'public/fonts'],
]

for (const [from, to] of jobs) {
  const src = path.join(projectRoot, from)
  const dest = path.join(projectRoot, to)
  if (!existsSync(src)) {
    console.warn(`skip ${from} (not found) — keeping existing ${to}`)
    continue
  }
  mkdirSync(dest, { recursive: true })
  cpSync(src, dest, { recursive: true })
  console.log(`synced ${from} -> ${to}`)
}
