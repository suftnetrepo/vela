export interface MoodDef {
  key:   string
  label: string
  emoji: string
  color: string
}

export const MOODS: MoodDef[] = [
  { key: 'happy',        label: 'Happy',        emoji: '😊', color: '#F59E4A' },
  { key: 'calm',         label: 'Calm',         emoji: '😌', color: '#7BAF8E' },
  { key: 'energetic',    label: 'Energetic',    emoji: '⚡', color: '#F4A7B5' },
  { key: 'romantic',     label: 'Romantic',     emoji: '🥰', color: '#E8748A' },
  { key: 'tired',        label: 'Tired',        emoji: '😴', color: '#9B8EC4' },
  { key: 'sad',          label: 'Sad',          emoji: '😢', color: '#6B9FD4' },
  { key: 'anxious',      label: 'Anxious',      emoji: '😰', color: '#C084FC' },
  { key: 'irritable',    label: 'Irritable',    emoji: '😤', color: '#E85555' },
  { key: 'sensitive',    label: 'Sensitive',    emoji: '💧', color: '#82C5BE' },
  { key: 'focused',      label: 'Focused',      emoji: '🎯', color: '#4CAF88' },
  { key: 'indifferent',  label: 'Meh',          emoji: '😶', color: '#B8899A' },
  { key: 'grateful',     label: 'Grateful',     emoji: '🙏', color: '#F4A7B5' },
]

export const MOOD_MAP = Object.fromEntries(MOODS.map(m => [m.key, m]))

export interface FlowDef {
  key:    string
  label:  string
  emoji:  string
  drops:  number    // visual indicator (1-4)
  color:  string
}

export const FLOW_LEVELS: FlowDef[] = [
  { key: 'none',     label: 'None',     emoji: '○',  drops: 0, color: '#E0E0E0' },
  { key: 'spotting', label: 'Spotting', emoji: '·',  drops: 1, color: '#F9C8D1' },
  { key: 'light',    label: 'Light',    emoji: '💧', drops: 1, color: '#F4A7B5' },
  { key: 'medium',   label: 'Medium',   emoji: '💧', drops: 2, color: '#E8748A' },
  { key: 'heavy',    label: 'Heavy',    emoji: '💧', drops: 3, color: '#C4506A' },
]

export const FLOW_MAP = Object.fromEntries(FLOW_LEVELS.map(f => [f.key, f]))
