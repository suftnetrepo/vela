export interface MoodDef {
  key:            string
  label:          string
  emoji:          string
  color:          string
  defaultVisible: boolean
}

// Full master mood list — alphabetical
// defaultVisible = true  → shown by default in the log screen
// defaultVisible = false → available but hidden until user enables it
export const ALL_MOODS: MoodDef[] = [
  { key: 'angry',        label: 'Angry',        emoji: '😠', color: '#E85555', defaultVisible: false },
  { key: 'angelic',      label: 'Angelic',       emoji: '😇', color: '#F4A7B5', defaultVisible: false },
  { key: 'anxious',      label: 'Anxious',       emoji: '😰', color: '#C084FC', defaultVisible: true  },
  { key: 'ashamed',      label: 'Ashamed',       emoji: '😳', color: '#E8748A', defaultVisible: false },
  { key: 'assertive',    label: 'Assertive',     emoji: '😤', color: '#7BAF8E', defaultVisible: false },
  { key: 'bashful',      label: 'Bashful',       emoji: '😊', color: '#F4A7B5', defaultVisible: false },
  { key: 'blue',         label: 'Blue',          emoji: '😔', color: '#6B9FD4', defaultVisible: false },
  { key: 'bored',        label: 'Bored',         emoji: '😑', color: '#B8899A', defaultVisible: false },
  { key: 'calm',         label: 'Calm',          emoji: '😌', color: '#7BAF8E', defaultVisible: true  },
  { key: 'confident',    label: 'Confident',     emoji: '😎', color: '#F59E4A', defaultVisible: true  },
  { key: 'cranky',       label: 'Cranky',        emoji: '😒', color: '#E85555', defaultVisible: false },
  { key: 'depressed',    label: 'Depressed',     emoji: '😞', color: '#6B9FD4', defaultVisible: false },
  { key: 'disappointed', label: 'Disappointed',  emoji: '😟', color: '#9B8EC4', defaultVisible: false },
  { key: 'distrustful',  label: 'Distrustful',   emoji: '😧', color: '#B8899A', defaultVisible: false },
  { key: 'dynamic',      label: 'Dynamic',       emoji: '🤩', color: '#F59E4A', defaultVisible: false },
  { key: 'embarrassed',  label: 'Embarrassed',   emoji: '😬', color: '#F4A7B5', defaultVisible: false },
  { key: 'emotional',    label: 'Emotional',     emoji: '🥹', color: '#E8748A', defaultVisible: true  },
  { key: 'energetic',    label: 'Energetic',     emoji: '⚡', color: '#F4A7B5', defaultVisible: true  },
  { key: 'excited',      label: 'Excited',       emoji: '😄', color: '#F59E4A', defaultVisible: false },
  { key: 'exhausted',    label: 'Exhausted',     emoji: '😩', color: '#9B8EC4', defaultVisible: true  },
  { key: 'flirtatious',  label: 'Flirtatious',   emoji: '😘', color: '#E8748A', defaultVisible: false },
  { key: 'focused',      label: 'Focused',       emoji: '🎯', color: '#4CAF88', defaultVisible: false },
  { key: 'forgetful',    label: 'Forgetful',     emoji: '🤔', color: '#B8899A', defaultVisible: false },
  { key: 'frisky',       label: 'Frisky',        emoji: '😏', color: '#C084FC', defaultVisible: false },
  { key: 'frustrated',   label: 'Frustrated',    emoji: '😤', color: '#E85555', defaultVisible: false },
  { key: 'furious',      label: 'Furious',       emoji: '🤬', color: '#E85555', defaultVisible: false },
  { key: 'grateful',     label: 'Grateful',      emoji: '🙏', color: '#F4A7B5', defaultVisible: false },
  { key: 'happy',        label: 'Happy',         emoji: '😊', color: '#F59E4A', defaultVisible: true  },
  { key: 'homey',        label: 'Homey',         emoji: '🏡', color: '#7BAF8E', defaultVisible: false },
  { key: 'hopeful',      label: 'Hopeful',       emoji: '🌟', color: '#F59E4A', defaultVisible: false },
  { key: 'ill',          label: 'Ill',           emoji: '🤒', color: '#4CAF88', defaultVisible: false },
  { key: 'impatient',    label: 'Impatient',     emoji: '😫', color: '#E85555', defaultVisible: false },
  { key: 'in_love',      label: 'In love',       emoji: '🥰', color: '#E8748A', defaultVisible: true  },
  { key: 'indifferent',  label: 'Indifferent',   emoji: '😐', color: '#B8899A', defaultVisible: false },
  { key: 'industrious',  label: 'Industrious',   emoji: '💪', color: '#4CAF88', defaultVisible: false },
  { key: 'inspired',     label: 'Inspired',      emoji: '✨', color: '#C084FC', defaultVisible: false },
  { key: 'irritable',    label: 'Irritable',     emoji: '😒', color: '#E85555', defaultVisible: true  },
  { key: 'jealous',      label: 'Jealous',       emoji: '😤', color: '#9B8EC4', defaultVisible: false },
  { key: 'jubilant',     label: 'Jubilant',      emoji: '🎉', color: '#F59E4A', defaultVisible: false },
  { key: 'lonely',       label: 'Lonely',        emoji: '🥺', color: '#6B9FD4', defaultVisible: false },
  { key: 'mischievous',  label: 'Mischievous',   emoji: '😈', color: '#9B8EC4', defaultVisible: false },
  { key: 'miserable',    label: 'Miserable',     emoji: '😿', color: '#6B9FD4', defaultVisible: false },
  { key: 'morose',       label: 'Morose',        emoji: '😶', color: '#6B9FD4', defaultVisible: false },
  { key: 'nesting',      label: 'Nesting',       emoji: '🪺', color: '#7BAF8E', defaultVisible: false },
  { key: 'neutral',      label: 'Neutral',       emoji: '😑', color: '#B8899A', defaultVisible: false },
  { key: 'normal',       label: 'Normal',        emoji: '🙂', color: '#7BAF8E', defaultVisible: false },
  { key: 'panicky',      label: 'Panicky',       emoji: '😱', color: '#E85555', defaultVisible: false },
  { key: 'peaceful',     label: 'Peaceful',      emoji: '☮️', color: '#7BAF8E', defaultVisible: false },
  { key: 'playful',      label: 'Playful',       emoji: '😜', color: '#F59E4A', defaultVisible: false },
  { key: 'proud',        label: 'Proud',         emoji: '🥲', color: '#F59E4A', defaultVisible: false },
  { key: 'relaxed',      label: 'Relaxed',       emoji: '😌', color: '#7BAF8E', defaultVisible: true  },
  { key: 'romantic',     label: 'Romantic',      emoji: '💕', color: '#E8748A', defaultVisible: false },
  { key: 'sad',          label: 'Sad',           emoji: '😢', color: '#6B9FD4', defaultVisible: true  },
  { key: 'satisfied',    label: 'Satisfied',     emoji: '😋', color: '#4CAF88', defaultVisible: false },
  { key: 'secretive',    label: 'Secretive',     emoji: '🤫', color: '#9B8EC4', defaultVisible: false },
  { key: 'sensitive',    label: 'Sensitive',     emoji: '💧', color: '#82C5BE', defaultVisible: true  },
  { key: 'sleepy',       label: 'Sleepy',        emoji: '😴', color: '#9B8EC4', defaultVisible: false },
  { key: 'smug',         label: 'Smug',          emoji: '😏', color: '#B8899A', defaultVisible: false },
  { key: 'stressed',     label: 'Stressed',      emoji: '😵', color: '#E85555', defaultVisible: true  },
  { key: 'stunned',      label: 'Stunned',       emoji: '😳', color: '#6B9FD4', defaultVisible: false },
  { key: 'surprised',    label: 'Surprised',     emoji: '😲', color: '#F59E4A', defaultVisible: false },
  { key: 'tense',        label: 'Tense',         emoji: '😬', color: '#E85555', defaultVisible: false },
  { key: 'tired',        label: 'Tired',         emoji: '🥱', color: '#9B8EC4', defaultVisible: true  },
  { key: 'tormented',    label: 'Tormented',     emoji: '😖', color: '#E85555', defaultVisible: false },
  { key: 'worried',      label: 'Worried',       emoji: '😟', color: '#C084FC', defaultVisible: false },
]

// Settings key prefix for mood visibility
export const MOOD_SETTING_PREFIX = 'mood_visible_'

// Default visible moods (used as fallback and for display in MoodSelector)
export const MOODS = ALL_MOODS.filter(m => m.defaultVisible)

export const MOOD_MAP = Object.fromEntries(ALL_MOODS.map(m => [m.key, m]))

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
