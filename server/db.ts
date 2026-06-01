import { eq, isNull, gte, lte, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, folders, tasks, timetableSlots, completionEvents, Folder, Task, TimetableSlot, CompletionEvent } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Folder queries
export async function getUserFolders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(folders)
    .where(and(eq(folders.userId, userId), isNull(folders.parentId)));
}

export async function getFolderChildren(folderId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(folders)
    .where(and(eq(folders.parentId, folderId), eq(folders.userId, userId)));
}

export async function getFolderById(folderId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(folders)
    .where(and(eq(folders.id, folderId), eq(folders.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Task queries
export async function getFolderTasks(folderId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(tasks)
    .where(and(eq(tasks.folderId, folderId), eq(tasks.userId, userId)));
}

export async function getUserTasks(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.userId, userId));
}

export async function getTaskById(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Timetable queries
export async function getUserTimetableSlots(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(timetableSlots)
    .where(and(eq(timetableSlots.userId, userId), eq(timetableSlots.isActive, 1)));
}

export async function getTimetableSlotsForDay(userId: number, dayOfWeek: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(timetableSlots)
    .where(
      and(
        eq(timetableSlots.userId, userId),
        eq(timetableSlots.dayOfWeek, dayOfWeek),
        eq(timetableSlots.isActive, 1)
      )
    );
}

// Completion event queries
export async function getUserCompletionEvents(
  userId: number,
  startDate: Date,
  endDate: Date
) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(completionEvents)
    .where(
      and(
        eq(completionEvents.userId, userId),
        gte(completionEvents.completedAt, startDate),
        lte(completionEvents.completedAt, endDate)
      )
    )
    .orderBy(desc(completionEvents.completedAt));
}

export async function getTaskCompletionEvents(taskId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(completionEvents)
    .where(and(eq(completionEvents.taskId, taskId), eq(completionEvents.userId, userId)))
    .orderBy(desc(completionEvents.completedAt));
}
