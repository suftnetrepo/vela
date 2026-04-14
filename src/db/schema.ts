import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── cycles ────────────────────────────────────────────────────────────────
export const cycles = sqliteTable('cycles', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  startDate:    text('start_date').notNull(),
  endDate:      text('end_date'),
  periodLength: integer('period_length'),
  cycleLength:  integer('cycle_length'),
  isActive:     integer('is_active').default(1),
  notes:        text('notes'),
  createdAt:    text('created_at').notNull(),
  updatedAt:    text('updated_at').notNull(),
})

// ─── daily_logs ─────────────────────────────────────────────────────────────
export const dailyLogs = sqliteTable('daily_logs', {
  id:           integer('id').primaryKey({ autoIncrement: true }),
  date:         text('date').notNull().unique(),
  cycleId:      integer('cycle_id').references(() => cycles.id),
  flow:         text('flow'),
  mood:         text('mood'),
  energyLevel:  integer('energy_level'),
  sexualDesire: integer('sexual_desire'),
  temperature:  real('temperature'),
  weight:       real('weight'),
  notes:        text('notes'),
  createdAt:    text('created_at').notNull(),
  updatedAt:    text('updated_at').notNull(),
})

// ─── symptom_logs ───────────────────────────────────────────────────────────
export const symptomLogs = sqliteTable('symptom_logs', {
  id:         integer('id').primaryKey({ autoIncrement: true }),
  date:       text('date').notNull(),
  dailyLogId: integer('daily_log_id').references(() => dailyLogs.id),
  symptomKey: text('symptom_key').notNull(),
  intensity:  integer('intensity').default(1),
  createdAt:  text('created_at').notNull(),
})

// ─── settings ───────────────────────────────────────────────────────────────
export const settings = sqliteTable('settings', {
  key:       text('key').primaryKey(),
  value:     text('value').notNull(),
  updatedAt: text('updated_at').notNull(),
})

// ─── notifications ──────────────────────────────────────────────────────────
export const notifications = sqliteTable('notifications', {
  id:          integer('id').primaryKey({ autoIncrement: true }),
  type:        text('type').notNull(),
  scheduledAt: text('scheduled_at').notNull(),
  expoId:      text('expo_id'),
  delivered:   integer('delivered').default(0),
  createdAt:   text('created_at').notNull(),
})

// ─── Types ───────────────────────────────────────────────────────────────────
export type Cycle        = typeof cycles.$inferSelect
export type NewCycle     = typeof cycles.$inferInsert
export type DailyLog     = typeof dailyLogs.$inferSelect
export type NewDailyLog  = typeof dailyLogs.$inferInsert
export type SymptomLog   = typeof symptomLogs.$inferSelect
export type NewSymptomLog = typeof symptomLogs.$inferInsert
export type Setting      = typeof settings.$inferSelect
export type Notification = typeof notifications.$inferSelect
