/**
 * SPLASH SCREEN DESIGN SPECIFICATION
 *
 * Vela Splash Screen — Premium, Calm, Branded
 * To be implemented as PNG assets for Expo splash screen
 *
 * ==================================================================
 * DESIGN BRIEF
 * ==================================================================
 *
 * The splash screen appears during app boot while:
 * - RevenueCat initializes
 * - Database loads
 * - Premium state hydrates
 * - User authentication checks
 *
 * Duration: ~1-2 seconds (depends on device)
 * Full-screen: Yes
 * Orientation: Portrait
 * Safe area: Avoid system UI (notches, home indicators)
 *
 * ==================================================================
 * LAYOUT STRUCTURE (TOP TO BOTTOM)
 * ==================================================================
 *
 * 1. VERTICAL CENTER WITH SPACING
 *    - Vertically and horizontally centered
 *    - Ample breathing room
 *
 * 2. FLOWER MARK
 *    - Icon: MaterialCommunityIcons 'flower'
 *    - Size: 88px × 88px
 *    - Color: Primary (Rose: #E8748A / Lavender: #9B8EC4 / Sage: #7BAF8E)
 *    - Opacity: 100%
 *
 * 3. SPACING
 *    - Gap between icon and text: 20px
 *
 * 4. WORDMARK "Vela"
 *    - Font: Plus Jakarta Sans Bold (700)
 *    - Size: 48px
 *    - Color: Primary (same as icon)
 *    - Letter spacing: -0.4px
 *    - Text align: center
 *
 * ==================================================================
 * BACKGROUND
 * ==================================================================
 *
 * Base color: Background color from current theme
 * - Rose theme: #FFFBFC (off-white with pink tint)
 * - Lavender theme: #FAFAFF (off-white with lavender tint)
 * - Sage theme: #FAFCFB (off-white with sage tint)
 *
 * Optional accent:
 * - Very subtle gradient fade (bottom 40px)
 * - Direction: Top to bottom
 * - Opacity: 2-5% (extremely subtle)
 *
 * ==================================================================
 * TECHNICAL SPECS
 * ==================================================================
 *
 * **Image dimensions (for Expo):**
 * - Default (mdpi): 512 × 512px
 * - High DPI variants production-ready
 *
 * **Expo config (app.json):**
 * ```json
 * "splash": {
 *   "image": "./assets/images/splash.png",
 *   "resizeMode": "contain",
 *   "backgroundColor": "#FFFBFC"
 * }
 * ```
 *
 * **Implementation:**
 * Since the splash screen uses a static image, we recommend:
 * 1. Create design in your preferred tool (Figma, Sketch, etc.)
 * 2. Export as PNG (512×512 or larger)
 * 3. Use Expo's EAS Build to generate platform-specific splash assets
 * 4. Or manually create platform variants:
 *    - iOS: 540×1080px (uses Safe Area consideration)
 *    - Android: 432×864px (hdpi baseline variant)
 *
 * **Color variants:**
 * Consider creating one splash per theme, or use a neutral color
 * that works across all three theme colors.
 *
 * Best approach: Single splash using Rose theme colors (most common)
 * Alternative: Neutral palette that works with all themes
 *
 * ==================================================================
 * DESIGN NOTES
 * ==================================================================
 *
 * - Keep it minimal: Brand + background only
 * - No loading spinners or progress indicators
 * - No text beyond "Vela"
 * - No marketing copy
 * - No clutter
 * - High contrast between icon/text and background
 * - Calm, premium, private-first aesthetic
 *
 * The user should see this only once (during initial boot),
 * and it should feel like the natural opening to Vela experience.
 *
 * ==================================================================
 * IMPLEMENTATION REFERENCE CODE
 * ==================================================================
 *
 * If you want to generate this dynamically via SVG:
 *
 * ```tsx
 * import * as FileSystem from 'expo-file-system';
 * import * as SVG from 'react-native-svg';
 *
 * const splashSvg = `
 *   <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
 *     <!-- Background -->
 *     <rect width="512" height="512" fill="#FFFBFC"/>
 *
 *     <!-- Flower icon (use Material Design Flower)
 *          For SVG export, convert MaterialCommunityIcons 'flower' glyph -->
 *     <g transform="translate(256, 180)">
 *       <!-- Flower petals and center (embedded SVG path) -->
 *       <!-- Color: #E8748A -->
 *     </g>
 *
 *     <!-- Vela wordmark -->
 *     <text x="256" y="350" font-family="Plus Jakarta Sans"
 *       font-size="48" font-weight="700" fill="#E8748A"
 *       text-anchor="middle">Vela</text>
 *   </svg>
 * `;
 * ```
 *
 * However, for simplicity, use static PNG asset.
 *
 * ==================================================================
 */
