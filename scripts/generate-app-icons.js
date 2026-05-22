#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const projectRoot = path.join(__dirname, '..')
const imagesDir = path.join(projectRoot, 'assets/images')
const sourceSvgPath = path.join(imagesDir, 'vela-app-icon.svg')

const sourceSvg = fs.readFileSync(sourceSvgPath, 'utf8')

const fullBleedBackgroundSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="128" y1="96" x2="896" y2="928" gradientUnits="userSpaceOnUse">
      <stop stop-color="#9C4DFF"/>
      <stop offset="0.48" stop-color="#D94AAE"/>
      <stop offset="1" stop-color="#F47C91"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
</svg>
`

const outputs = [
  { fileName: 'icon.png', size: 1024, mode: 'full-bleed' },
  { fileName: 'adaptive-icon.png', size: 1024, mode: 'adaptive-foreground' },
  { fileName: 'favicon.png', size: 48, mode: 'full-bleed' },
]

async function renderSvg(svg, width, height = width) {
  return sharp(Buffer.from(svg), { density: 144 })
    .resize(width, height)
    .png()
    .toBuffer()
}

async function buildFullBleedIcon(size) {
  const background = await renderSvg(fullBleedBackgroundSvg, size)
  const icon = await renderSvg(sourceSvg, size)

  return sharp(background)
    .composite([{ input: icon }])
    .removeAlpha()
    .png()
    .toBuffer()
}

async function buildAdaptiveForeground(size) {
  const foregroundSize = Math.round(size * 0.8125)
  const icon = await renderSvg(sourceSvg, foregroundSize)
  const inset = Math.round((size - foregroundSize) / 2)

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: icon, left: inset, top: inset }])
    .png()
    .toBuffer()
}

async function generate() {
  console.log('Generating Vela app icon assets...')

  for (const output of outputs) {
    const outputPath = path.join(imagesDir, output.fileName)
    const buffer = output.mode === 'adaptive-foreground'
      ? await buildAdaptiveForeground(output.size)
      : await buildFullBleedIcon(output.size)

    await sharp(buffer).toFile(outputPath)
    const metadata = await sharp(outputPath).metadata()
    console.log(`- ${output.fileName}: ${metadata.width}x${metadata.height}, alpha=${metadata.hasAlpha ? 'yes' : 'no'}`)
  }
}

generate().catch((error) => {
  console.error('Failed to generate app icon assets:', error)
  process.exit(1)
})