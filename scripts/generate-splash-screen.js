#!/usr/bin/env node

/**
 * generate-splash-screen.js
 *
 * Generates branded Vela splash screens for all themes.
 * 
 * Usage:
 *   node scripts/generate-splash-screen.js
 * 
 * Requires: sharp (npm install sharp)
 * Output: ./assets/images/splash.png and variants
 */

const path = require('path')
const fs = require('fs')

// Configuration
const SPLASH_SIZE = 512
const ICON_SIZE = 88
const TEXT_SIZE = 48
const SPACING = 20

// Theme colors (primary)
const THEMES = {
  rose: '#E8748A',
  lavender: '#9B8EC4',
  sage: '#7BAF8E',
}

// Background colors (light variants)
const BACKGROUNDS = {
  rose: '#FFFBFC',
  lavender: '#FAFAFF',
  sage: '#FAFCFB',
}

// Check if sharp is available
let sharp
try {
  sharp = require('sharp')
} catch {
  console.error(
    '❌ sharp not found. Install with: npm install sharp\n' +
    'sharp is used to generate splash screen PNG assets.'
  )
  process.exit(1)
}

/**
 * Generate SVG for splash screen with embedded flower icon
 */
function generateSplashSvg(themeName) {
  const primaryColor = THEMES[themeName]
  const backgroundColor = BACKGROUNDS[themeName]

  // Flower icon path (simplified flower/bloom icon)
  // This is a stylized flower with petals and center
  const flowerPath = `
    <!-- Outer petals -->
    <g fill="${primaryColor}" opacity="0.8">
      <circle cx="0" cy="-30" r="18"/>
      <circle cx="26" cy="-15" r="18"/>
      <circle cx="26" cy="15" r="18"/>
      <circle cx="0" cy="30" r="18"/>
      <circle cx="-26" cy="15" r="18"/>
      <circle cx="-26" cy="-15" r="18"/>
    </g>
    <!-- Center circle -->
    <circle cx="0" cy="0" r="14" fill="${primaryColor}"/>
  `

  return `
    <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="512" height="512" fill="${backgroundColor}"/>
      
      <!-- Subtle gradient overlay (optional, commented out for static color) -->
      <!-- <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${backgroundColor}"/>
          <stop offset="100%" stop-color="${backgroundColor}" stop-opacity="0.95"/>
        </linearGradient>
      </defs>
      <rect width="512" height="512" fill="url(#fade)"/> -->

      <!-- Centered content group -->
      <g transform="translate(256, 230)">
        <!-- Flower icon (large, centered) -->
        <g transform="translate(0, -50)">
          ${flowerPath}
        </g>

        <!-- Vela wordmark text -->
        <text x="0" y="80"
          font-family="'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="48"
          font-weight="700"
          fill="${primaryColor}"
          text-anchor="middle"
          letter-spacing="-0.4"
        >
          Vela
        </text>
      </g>
    </svg>
  `
}

/**
 * Convert SVG to PNG using sharp
 */
async function generateSplashPng(themeName, outputPath) {
  try {
    console.log(`📝 Generating splash for ${themeName} theme...`)

    const svg = generateSplashSvg(themeName)

    // Convert SVG to PNG
    await sharp(Buffer.from(svg))
      .png()
      .toFile(outputPath)

    const stats = fs.statSync(outputPath)
    console.log(`✅ Generated: ${outputPath} (${(stats.size / 1024).toFixed(1)}kb)`)

    return true
  } catch (error) {
    console.error(`❌ Failed to generate splash for ${themeName}:`, error.message)
    return false
  }
}

/**
 * Main: Generate all splash screens
 */
async function main() {
  console.log('🎨 Vela Splash Screen Generator\n')

  // Ensure output directory exists
  const outputDir = path.join(__dirname, '../assets/images')
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Generate default splash (Rose theme - most common)
  const splashPath = path.join(outputDir, 'splash.png')
  await generateSplashPng('rose', splashPath)

  // Generate theme variants
  const variantsDir = path.join(outputDir, 'splash-variants')
  if (!fs.existsSync(variantsDir)) {
    fs.mkdirSync(variantsDir, { recursive: true })
  }

  for (const [themeName] of Object.entries(THEMES)) {
    const variantPath = path.join(variantsDir, `splash-${themeName}.png`)
    await generateSplashPng(themeName, variantPath)
  }

  console.log('\n✨ Splash screen generation complete!')
  console.log(`\n📱 To use theme-specific splashes:`)
  console.log(`   1. Update app.json splash.image path based on active theme`)
  console.log(`   2. Or use single splash.png that's theme-agnostic`)
}

main().catch(console.error)
