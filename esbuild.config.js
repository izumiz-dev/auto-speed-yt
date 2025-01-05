import * as esbuild from 'esbuild'
import { copyFile, mkdir } from 'node:fs/promises'

const isDev = process.argv.includes('--watch')

const buildOptions = {
  entryPoints: [
    'src/background.ts',
    'src/content.ts',
    'src/popup.ts',
    'src/lib/prompt.ts'
  ],
  bundle: true,
  outdir: 'dist',
  format: 'esm',
  platform: 'browser',
  target: 'chrome58',
  minify: !isDev,
  sourcemap: isDev,
  tsconfig: 'tsconfig.json',
  loader: { '.json': 'text' }
}

async function copyAssets() {
  await mkdir('dist', { recursive: true })
  await Promise.all([
    copyFile('src/popup.html', 'dist/popup.html'),
    copyFile('src/popup.css', 'dist/popup.css'),
    copyFile('public/manifest.json', 'dist/manifest.json')
  ])
}

if (isDev) {
  const ctx = await esbuild.context(buildOptions)
  await ctx.watch()
} else {
  await esbuild.build(buildOptions)
}

await copyAssets()
