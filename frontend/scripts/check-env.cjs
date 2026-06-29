/**
 * Validates required env vars before running a command.
 * Loads .env manually, applies CI/Vercel defaults, then execs the command.
 *
 * Build: BASE_PATH (can be empty), BACKEND_PORT
 * Dev: PORT, BACKEND_PORT, BASE_PATH
 */
const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const envPath = path.join(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    const key = trimmed.slice(0, eq)
    const val = trimmed.slice(eq + 1)
    if (process.env[key] === undefined) process.env[key] = val
  }
}

// Vercel/Render/CI — env 미설정 시 배포가 깨지지 않도록 기본값 적용
if (process.env.BACKEND_PORT === undefined) {
  process.env.BACKEND_PORT = '8000'
}
if (process.env.BASE_PATH === undefined) {
  process.env.BASE_PATH = process.env.VERCEL ? '/' : './'
}

const args = process.argv.slice(2)
const isBuild = args.some((a) => a.includes('build'))
const isDev = args.some((a) => a === 'vite' || a.includes('vite '))

const requiredNonEmpty = isBuild
  ? ['BACKEND_PORT']
  : isDev
    ? ['PORT', 'BACKEND_PORT']
    : ['BACKEND_PORT']

const missingNonEmpty = requiredNonEmpty.filter((k) => !process.env[k])

if (missingNonEmpty.length > 0) {
  console.error(`\n❌ Missing required env vars: ${missingNonEmpty.join(', ')}`)
  console.error(`   Set them in your environment or copy .env.example to .env\n`)
  process.exit(1)
}

try {
  execSync(args.join(' '), { stdio: 'inherit', env: process.env })
} catch (e) {
  process.exit(e.status || 1)
}
