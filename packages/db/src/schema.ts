import { pgTable, serial, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
  date: timestamp('date').notNull(),
  endDate: timestamp('end_date').notNull(),
})
