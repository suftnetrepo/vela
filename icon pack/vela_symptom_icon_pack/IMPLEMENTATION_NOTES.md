# Implementation Notes

## Intended usage
- Put `symptom-icon-map.ts` in a shared icon utility layer.
- Import SVGs into your existing icon pipeline, or convert them to React Native components if needed.
- Use `resolveSymptomIcon(symptomKey, category)` instead of hardcoding icons in screens.

## Priority
1. Cervical
2. Digestive
3. Pain
4. Physical
5. Skin
6. Mood
7. Other

## Known placeholders
- `cervical_firmness` and `cervical_opening` still reuse related starter icons until a more explicit cervix-specific set is designed.

## Recommendation
Audit your exact symptom keys before final wiring. If a key differs from this map, add an alias rather than duplicating icon logic in the UI.
