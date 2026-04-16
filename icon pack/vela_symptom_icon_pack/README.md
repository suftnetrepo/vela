# Vela Symptom Icon Pack v2

Expanded starter icon pack and mapping layer for Vela.

## Included
- starter SVG icon pack for Cervical, Digestive, Pain, Physical, Skin, Mood, and Other
- `symptom-icon-map.ts` with:
  - icon map
  - aliases
  - category fallbacks
  - resolver helper

## Goal
Remove placeholder duplicates like `!`, `?`, and `-` from symptom tiles and give the agent a single source of truth.

## Notes
- This is a practical starter system, not a final bespoke medical illustration set.
- A few niche keys may still need remapping to match your exact database keys.
- Keep these SVGs as source artwork and convert them into the runtime format your app already uses.
