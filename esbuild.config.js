import * as esbuild from 'esbuild'
import { copyFile, mkdir } from 'node:fs/promises'

const isDev = process.argv.includes('--watch')

const buildOptions = {
  entryPoints: [
    'src/background.ts',
    'src/content.ts',
    'src/popup.tsx',
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
  loader: { '.json': 'text' },
  jsxFactory: 'h',
  jsxFragment: 'Fragment'
}

const buildLogger = {
  name: 'build-logger',
  setup(build) {
    build.onEnd(result => {
      if (result.errors.length === 0) {
        const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
        console.log(`✅ [${now}] Build completed successfully`)
      }
    })
  }
}

buildOptions.plugins = [buildLogger]

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
