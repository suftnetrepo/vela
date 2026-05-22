/**
 * VelaIcon — single import point for all icons in the app.
 *
 * Supports both:
 * - Vector icons: @expo/vector-icons (Feather, Ionicons, MaterialCommunityIcons)
 * - SVG icons: Custom symptom/mood SVGs from assets/icons/symptoms/
 *
 * Usage:
 *   <VelaIcon name="calendar" size={22} color={Colors.primary} />           // Vector icon
 *   <VelaIcon name="pain_cramps" size={24} color={Colors.primary} />        // SVG icon
 */

import React from 'react'
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import Svg, { Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg'
import { SvgSymptomIcon, isSvgSymptomIcon } from './SvgSymptomIcon'

function VelaBrandIcon({ size, style }: { size: number; style?: object }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" style={style}>
      <Defs>
        <LinearGradient id="vela-bg" x1="128" y1="96" x2="896" y2="928" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#9C4DFF" />
          <Stop offset="0.48" stopColor="#D94AAE" />
          <Stop offset="1" stopColor="#F47C91" />
        </LinearGradient>
        <LinearGradient id="vela-petal" x1="512" y1="205" x2="512" y2="820" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFFFFF" />
          <Stop offset="0.55" stopColor="#FFE1EC" />
          <Stop offset="1" stopColor="#F7A5BE" />
        </LinearGradient>
        <LinearGradient id="vela-petal-soft" x1="512" y1="332" x2="512" y2="798" gradientUnits="userSpaceOnUse">
          <Stop stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="1" stopColor="#F6A0B9" stopOpacity="0.68" />
        </LinearGradient>
      </Defs>

      <Rect width="1024" height="1024" rx="224" fill="url(#vela-bg)" />

      <G>
        <Path d="M512 718C409 613 387 448 512 258C637 448 615 613 512 718Z" fill="url(#vela-petal)" opacity="0.96" />
        <Path d="M390 737C290 647 281 501 391 346C481 487 475 629 390 737Z" fill="url(#vela-petal-soft)" opacity="0.88" />
        <Path d="M634 737C734 647 743 501 633 346C543 487 549 629 634 737Z" fill="url(#vela-petal-soft)" opacity="0.88" />
        <Path d="M298 754C257 654 295 536 417 466C434 595 393 694 298 754Z" fill="#F89AB8" opacity="0.55" />
        <Path d="M726 754C767 654 729 536 607 466C590 595 631 694 726 754Z" fill="#F89AB8" opacity="0.55" />
        <Path d="M512 770C459 720 449 641 512 548C575 641 565 720 512 770Z" fill="#FFFFFF" opacity="0.98" />
      </G>
    </Svg>
  )
}

// ─── Icon catalogue ──────────────────────────────────────────────────────────
// All icon names used anywhere in Vela, mapped to their family + glyph.
// Add new icons here — screens never touch the families directly.

type IconFamily = 'feather' | 'ionicons' | 'mci'

interface IconDef {
  family: IconFamily
  glyph:  string
}

const ICON_MAP: Record<string, IconDef> = {
  // ── Navigation tabs ─────────────────────────────────────────────────────
  'tab-home':          { family: 'mci',      glyph: 'home' },
  'tab-home-active':   { family: 'mci',      glyph: 'home' },
  'tab-log':           { family: 'mci',      glyph: 'pencil' },
  'tab-log-active':    { family: 'mci',      glyph: 'pencil' },
  'tab-insights':      { family: 'mci',      glyph: 'chart-box' },
  'tab-insights-active':{ family: 'mci',      glyph: 'chart-box' },
  'tab-settings':      { family: 'mci',      glyph: 'cog' },
  'tab-settings-active':{ family: 'mci',      glyph: 'cog' },

  // ── Calendar / cycle ────────────────────────────────────────────────────
  'calendar':          { family: 'feather',  glyph: 'calendar' },
  'chevron-left':      { family: 'feather',  glyph: 'chevron-left' },
  'chevron-right':     { family: 'feather',  glyph: 'chevron-right' },
  'chevron-back':      { family: 'ionicons', glyph: 'chevron-back' },
  'cycle':             { family: 'mci',      glyph: 'sync' },
  'drop':              { family: 'mci',      glyph: 'water' },
  'flower':            { family: 'mci',      glyph: 'flower' },
  'flower-outline':    { family: 'mci',      glyph: 'flower-outline' },
  'leaf':              { family: 'mci',      glyph: 'leaf' },
  'moon':              { family: 'feather',  glyph: 'moon' },
  'sun':               { family: 'feather',  glyph: 'sun' },
  'star':              { family: 'feather',  glyph: 'star' },
  'star-filled':       { family: 'ionicons', glyph: 'star' },
  'zap':               { family: 'feather',  glyph: 'zap' },

  // ── Logging ─────────────────────────────────────────────────────────────
  'edit':              { family: 'feather',  glyph: 'edit-3' },
  'check':             { family: 'feather',  glyph: 'check' },
  'check-circle':      { family: 'feather',  glyph: 'check-circle' },
  'plus':              { family: 'feather',  glyph: 'plus' },
  'plus-circle':       { family: 'feather',  glyph: 'plus-circle' },
  'minus':             { family: 'feather',  glyph: 'minus' },
  'trash':             { family: 'feather',  glyph: 'trash-2' },
  'notes':             { family: 'feather',  glyph: 'file-text' },
  'thermometer':       { family: 'feather',  glyph: 'thermometer' },
  'weight':            { family: 'mci',      glyph: 'scale-bathroom' },
  'heart':             { family: 'mci',      glyph: 'heart-outline' },
  'heart-filled':      { family: 'mci',      glyph: 'heart' },
  'activity':          { family: 'feather',  glyph: 'activity' },

  // ── Moods ───────────────────────────────────────────────────────────────
  'mood-happy':        { family: 'ionicons', glyph: 'happy-outline' },
  'mood-sad':          { family: 'ionicons', glyph: 'sad-outline' },
  'mood-neutral':      { family: 'ionicons', glyph: 'remove-circle-outline' },
  'mood-anxious':      { family: 'mci',      glyph: 'emoticon-confused-outline' },
  'mood-energy':       { family: 'feather',  glyph: 'zap' },

  // ── Symptoms ────────────────────────────────────────────────────────────
  'cramps':            { family: 'mci',      glyph: 'lightning-bolt' },
  'headache':          { family: 'mci',      glyph: 'head-snowflake' },
  'bloating':          { family: 'mci',      glyph: 'circle-outline' },
  'fatigue':           { family: 'mci',      glyph: 'sleep' },
  'nausea':            { family: 'mci',      glyph: 'emoticon-sick-outline' },
  'acne':              { family: 'mci',      glyph: 'face-woman-shimmer-outline' },

  // ── Security ────────────────────────────────────────────────────────────
  'lock':              { family: 'feather',  glyph: 'lock' },
  'unlock':            { family: 'feather',  glyph: 'unlock' },
  'eye':               { family: 'feather',  glyph: 'eye' },
  'eye-off':           { family: 'feather',  glyph: 'eye-off' },
  'fingerprint':       { family: 'ionicons', glyph: 'finger-print' },
  'face-id':           { family: 'ionicons', glyph: 'scan-outline' },
  'shield':            { family: 'feather',  glyph: 'shield' },
  'shield-check':      { family: 'mci',      glyph: 'shield-check' },
  'key':               { family: 'feather',  glyph: 'key' },

  // ── Settings / UI ───────────────────────────────────────────────────────
  'settings':          { family: 'feather',  glyph: 'settings' },
  'bell':              { family: 'feather',  glyph: 'bell' },
  'bell-off':          { family: 'feather',  glyph: 'bell-off' },
  'palette':           { family: 'feather',  glyph: 'droplet' },
  'info':              { family: 'feather',  glyph: 'info' },
  'help':              { family: 'feather',  glyph: 'help-circle' },
  'arrow-left':        { family: 'feather',  glyph: 'arrow-left' },
  'arrow-right':       { family: 'feather',  glyph: 'arrow-right' },
  'arrow-up':          { family: 'feather',  glyph: 'arrow-up' },
  'close':             { family: 'feather',  glyph: 'x' },
  'more':              { family: 'feather',  glyph: 'more-horizontal' },
  'search':            { family: 'feather',  glyph: 'search' },
  'share':             { family: 'feather',  glyph: 'share-2' },
  'download':          { family: 'feather',  glyph: 'download' },
  'upload':            { family: 'feather',  glyph: 'upload' },
  'refresh':           { family: 'feather',  glyph: 'refresh-cw' },
  'copy':              { family: 'feather',  glyph: 'copy' },
  'alert':             { family: 'feather',  glyph: 'alert-circle' },
  'target':            { family: 'feather',  glyph: 'target' },
  'cloud':             { family: 'feather',  glyph: 'cloud' },
  'snowflake':         { family: 'feather',  glyph: 'cloud-snow' },
  'droplet':           { family: 'mci',      glyph: 'water-opacity' },
  'water':             { family: 'mci',      glyph: 'water' },
  'wind':              { family: 'mci',      glyph: 'wind-power' },
  'egg':               { family: 'mci',      glyph: 'egg' },

  // ── Premium ─────────────────────────────────────────────────────────────
  'premium':           { family: 'ionicons', glyph: 'sparkles' },
  'crown':             { family: 'mci',      glyph: 'crown' },
  'gift':              { family: 'feather',  glyph: 'gift' },
  'pill':              { family: 'mci',      glyph: 'pill' },
  'baby':              { family: 'mci',      glyph: 'baby-carriage' },
  'partner':           { family: 'feather',  glyph: 'users' },
  'report':            { family: 'feather',  glyph: 'file-text' },

  // ── Phase-specific ──────────────────────────────────────────────────────
  'phase-menstrual':   { family: 'mci',      glyph: 'water' },
  'phase-follicular':  { family: 'mci',      glyph: 'leaf' },
  'phase-ovulation':   { family: 'mci',      glyph: 'star-four-points' },
  'phase-fertile':     { family: 'mci',      glyph: 'flower' },
  'phase-luteal':      { family: 'feather',  glyph: 'moon' },
  'phase-predicted':   { family: 'mci',      glyph: 'crystal-ball' },
}

// ─── Props ───────────────────────────────────────────────────────────────────
export interface VelaIconProps {
  name:    VelaIconName | string
  size?:   number
  color?:  string
  style?:  object
}

export type VelaIconName = keyof typeof ICON_MAP | 'vela'

// ─── Component ───────────────────────────────────────────────────────────────
export function VelaIcon({ name, size = 20, color = '#2D1B24', style }: VelaIconProps) {
  if (name === 'vela') {
    return <VelaBrandIcon size={size} style={style} />
  }

  // Check if this is an SVG symptom icon first
  if (typeof name === 'string' && isSvgSymptomIcon(name)) {
    try {
      return <SvgSymptomIcon name={name} size={size} color={color} />
    } catch (error) {
      // Fallback to vector icon if SVG rendering fails
      console.warn(`Failed to render SVG icon: ${name}`, error)
      return <Feather name="circle" size={size} color={color} style={style} />
    }
  }

  const def = ICON_MAP[name]

  if (!def) {
    // Fallback to a circle if icon name is unknown
    return <Feather name="circle" size={size} color={color} style={style} />
  }

  switch (def.family) {
    case 'feather':
      return <Feather name={def.glyph as any} size={size} color={color} style={style} />
    case 'ionicons':
      return <Ionicons name={def.glyph as any} size={size} color={color} style={style} />
    case 'mci':
      return <MaterialCommunityIcons name={def.glyph as any} size={size} color={color} style={style} />
    default:
      return <Feather name="circle" size={size} color={color} style={style} />
  }
}
