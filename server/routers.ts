import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import * as dbHelpers from "./db";
import { folders, tasks, timetableSlots, completionEvents, InsertFolder, InsertTask, InsertTimetableSlot, InsertCompletionEvent } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Folder Management
  folders: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return dbHelpers.getUserFolders(ctx.user.id);
    }),

    children: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .query(async ({ ctx, input }) => {
        return dbHelpers.getFolderChildren(input.folderId, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({ name: z.string().min(1), parentId: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const newFolder: InsertFolder = {
          userId: ctx.user.id,
          name: input.name,
          parentId: input.parentId || null,
        };

        const result = await db.insert(folders).values(newFolder);
        return { id: result[0].insertId, ...newFolder };
      }),

    update: protectedProcedure
      .input(z.object({ id: z.number(), name: z.string().min(1) }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const folder = await dbHelpers.getFolderById(input.id, ctx.user.id);
        if (!folder) throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });

        await db.update(folders).set({ name: input.name }).where(eq(folders.id, input.id));
        return { ...folder, name: input.name };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const folder = await dbHelpers.getFolderById(input.id, ctx.user.id);
        if (!folder) throw new TRPCError({ code: "NOT_FOUND", message: "Folder not found" });

        // Delete all tasks in this folder
        await db.delete(tasks).where(and(eq(tasks.folderId, input.id), eq(tasks.userId, ctx.user.id)));

        // Delete all child folders recursively
        const deleteChildFolders = async (parentId: number) => {
          const children = await dbHelpers.getFolderChildren(parentId, ctx.user.id);
          for (const child of children) {
            await deleteChildFolders(child.id);
          }
          await db.delete(folders).where(eq(folders.id, parentId));
        };

        await deleteChildFolders(input.id);
        return { success: true };
      }),
  }),

  // Task Management
  tasks: router({
    list: protectedProcedure
      .input(z.object({ folderId: z.number() }))
      .query(async ({ ctx, input }) => {
        return dbHelpers.getFolderTasks(input.folderId, ctx.user.id);
      }),

    all: protectedProcedure.query(async ({ ctx }) => {
      return dbHelpers.getUserTasks(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        return dbHelpers.getTaskById(input.id, ctx.user.id);
      }),

    create: protectedProcedure
      .input(z.object({
        folderId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["Low", "Medium", "High"]).default("Low"),
        dueDate: z.date().optional(),
        estimatedMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const newTask: InsertTask = {
          userId: ctx.user.id,
          folderId: input.folderId,
          title: input.title,
          description: input.description || null,
          priority: input.priority,
          dueDate: input.dueDate || null,
          estimatedMinutes: input.estimatedMinutes || null,
          status: "Pending",
        };

        const result = await db.insert(tasks).values(newTask);
        return { id: result[0].insertId, ...newTask };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["Pending", "In Progress", "Completed"]).optional(),
        priority: z.enum(["Low", "Medium", "High"]).optional(),
        dueDate: z.date().optional(),
        estimatedMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const task = await dbHelpers.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

        const updateData: Record<string, any> = {};
        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
        if (input.estimatedMinutes !== undefined) updateData.estimatedMinutes = input.estimatedMinutes;

        await db.update(tasks).set(updateData).where(eq(tasks.id, input.id));
        return { ...task, ...updateData };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        const task = await dbHelpers.getTaskById(input.id, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

        // Delete associated timetable slots
        await db.delete(timetableSlots).where(and(eq(timetableSlots.taskId, input.id), eq(timetableSlots.userId, ctx.user.id)));

        // Delete task
        await db.delete(tasks).where(eq(tasks.id, input.id));
        return { success: true };
      }),
  }),

  // Timetable Management
  timetable: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return dbHelpers.getUserTimetableSlots(ctx.user.id);
    }),

    forDay: protectedProcedure
      .input(z.object({ dayOfWeek: z.number().min(0).max(6) }))
      .query(async ({ ctx, input }) => {
        return dbHelpers.getTimetableSlotsForDay(ctx.user.id, input.dayOfWeek);
      }),

    create: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^\d{2}:\d{2}$/),
        endTime: z.string().regex(/^\d{2}:\d{2}$/),
        recurrence: z.enum(["Daily", "Weekly", "Custom"]).default("Weekly"),
        customDays: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify task exists and belongs to user
        const task = await dbHelpers.getTaskById(input.taskId, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

        const newSlot: InsertTimetableSlot = {
          userId: ctx.user.id,
          taskId: input.taskId,
          dayOfWeek: input.dayOfWeek,
          startTime: input.startTime,
          endTime: input.endTime,
          recurrence: input.recurrence,
          customDays: input.customDays || null,
          isActive: 1,
        };

        const result = await db.insert(timetableSlots).values(newSlot);
        return { id: result[0].insertId, ...newSlot };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        await db.delete(timetableSlots).where(and(eq(timetableSlots.id, input.id), eq(timetableSlots.userId, ctx.user.id)));
        return { success: true };
      }),
  }),

  // Analytics
  analytics: router({
    summary: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get today's completion events
      const todayEvents = await dbHelpers.getUserCompletionEvents(ctx.user.id, today, tomorrow);

      // Get all tasks
      const allTasks = await dbHelpers.getUserTasks(ctx.user.id);

      // Count overdue tasks
      const now = new Date();
      const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "Completed");

      // Count pending tasks
      const pendingTasks = allTasks.filter(t => t.status === "Pending" || t.status === "In Progress");

      // Calculate completion rate (today)
      const completedToday = todayEvents.length;
      const totalTasksToday = allTasks.length;
      const completionRate = totalTasksToday > 0 ? (completedToday / totalTasksToday) * 100 : 0;

      // Calculate average time in "In Progress"
      const inProgressTasks = allTasks.filter(t => t.status === "In Progress");
      const avgTimeInProgress = inProgressTasks.length > 0
        ? inProgressTasks.reduce((sum, t) => sum + (t.estimatedMinutes || 0), 0) / inProgressTasks.length
        : 0;

      // Calculate streak (consecutive days with completed tasks)
      let streak = 0;
      let checkDate = new Date();
      checkDate.setHours(0, 0, 0, 0);

      while (true) {
        const nextDay = new Date(checkDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const dayEvents = await dbHelpers.getUserCompletionEvents(ctx.user.id, checkDate, nextDay);
        if (dayEvents.length === 0) break;
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }

      return {
        completionRate: Math.round(completionRate),
        overdueCount: overdueTasks.length,
        pendingCount: pendingTasks.length,
        avgTimeInProgress: Math.round(avgTimeInProgress),
        streak,
      };
    }),

    daily: protectedProcedure
      .input(z.object({ date: z.date() }))
      .query(async ({ ctx, input }) => {
        const startDate = new Date(input.date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const events = await dbHelpers.getUserCompletionEvents(ctx.user.id, startDate, endDate);
        return {
          date: input.date,
          completedCount: events.length,
          events,
        };
      }),

    weekly: protectedProcedure.query(async ({ ctx }) => {
      const endDate = new Date();
      endDate.setHours(0, 0, 0, 0);
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 7);

      const events = await dbHelpers.getUserCompletionEvents(ctx.user.id, startDate, endDate);

      // Group by day
      const byDay: Record<string, number> = {};
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        byDay[dateStr] = 0;
      }

      events.forEach(event => {
        const dateStr = new Date(event.completedAt).toISOString().split("T")[0];
        byDay[dateStr] = (byDay[dateStr] || 0) + 1;
      });

      return byDay;
    }),

    completeTask: protectedProcedure
      .input(z.object({ taskId: z.number(), durationMinutes: z.number().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database unavailable" });

        // Verify task exists
        const task = await dbHelpers.getTaskById(input.taskId, ctx.user.id);
        if (!task) throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });

        // Update task status
        await db.update(tasks).set({ status: "Completed" }).where(eq(tasks.id, input.taskId));

        // Log completion event
        const event: InsertCompletionEvent = {
          userId: ctx.user.id,
          taskId: input.taskId,
          durationMinutes: input.durationMinutes || null,
        };

        const result = await db.insert(completionEvents).values(event);
        return { id: result[0].insertId, ...event };
      }),
  }),
});

export type AppRouter = typeof appRouter;
