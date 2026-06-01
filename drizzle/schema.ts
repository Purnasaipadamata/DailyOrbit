import { int, mysqlEnum, mysqlTable, text, timestamp, tinyint, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Folders table for hierarchical task organization.
 * Supports unlimited nesting depth via parentId self-reference.
 */
export const folders = mysqlTable("folders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  parentId: int("parentId"), // null for root-level folders
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

/**
 * Tasks table with status, priority, due date, and duration tracking.
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  folderId: int("folderId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["Pending", "In Progress", "Completed"])
    .default("Pending")
    .notNull(),
  priority: mysqlEnum("priority", ["Low", "Medium", "High"])
    .default("Low")
    .notNull(),
  dueDate: timestamp("dueDate"),
  estimatedMinutes: int("estimatedMinutes"), // estimated duration in minutes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Timetable slots for scheduling tasks to specific time slots.
 * Supports recurrence patterns: Daily, Weekly, Custom.
 */
export const timetableSlots = mysqlTable("timetable_slots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  startTime: varchar("startTime", { length: 5 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 5 }).notNull(), // HH:MM format
  recurrence: mysqlEnum("recurrence", ["Daily", "Weekly", "Custom"])
    .default("Weekly")
    .notNull(),
  customDays: varchar("customDays", { length: 255 }), // comma-separated day indices for custom recurrence
  isActive: tinyint("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TimetableSlot = typeof timetableSlots.$inferSelect;
export type InsertTimetableSlot = typeof timetableSlots.$inferInsert;

/**
 * Completion events for tracking task completion history and analytics.
 */
export const completionEvents = mysqlTable("completion_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  taskId: int("taskId").notNull(),
  completedAt: timestamp("completedAt").defaultNow().notNull(),
  durationMinutes: int("durationMinutes"), // actual time spent
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CompletionEvent = typeof completionEvents.$inferSelect;
export type InsertCompletionEvent = typeof completionEvents.$inferInsert;