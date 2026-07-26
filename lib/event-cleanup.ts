/**
 * Event Cleanup Utility
 *
 * Automatically deletes events whose eventDate + 7 days has passed.
 * This ensures expired events are removed from both the database and Customer App.
 */

import cron from "node-cron";
import { prisma } from "./prisma";

const CLEANUP_CRON_EXPRESSION = "0 3 * * *"; // Runs daily at 3:00 AM

/**
 * Deletes events where eventDate + 7 days < now.
 * Returns the count of deleted events.
 */
export async function cleanupExpiredEvents(): Promise<number> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7);

  const deletedEvents = await prisma.event.deleteMany({
    where: {
      eventDate: {
        lt: cutoffDate,
      },
    },
  });

  if (deletedEvents.count > 0) {
    console.log(
      `[Event Cleanup] Deleted ${deletedEvents.count} expired event(s).`,
    );
  }

  return deletedEvents.count;
}

/**
 * Auto-initialize event cleanup when this module is imported.
 * Runs daily at 3:00 AM (Asia/Makassar) and also runs immediately on import.
 * Skipped in test environment.
 */
if (process.env.NODE_ENV !== "test") {
  cron.schedule(
    CLEANUP_CRON_EXPRESSION,
    () => {
      cleanupExpiredEvents().catch((err) => {
        console.error("[Event Cleanup] Scheduled run error:", err);
      });
    },
    { timezone: "Asia/Makassar" },
  );

  console.log(
    `[Event Cleanup] Scheduled to run daily at 3:00 AM (Asia/Makassar). Cron: ${CLEANUP_CRON_EXPRESSION}`,
  );

  // Run once on startup to clean up any already-expired events
  cleanupExpiredEvents().catch((err) => {
    console.error("[Event Cleanup] Initial run error:", err);
  });
} else {
  console.log("[Event Cleanup] Skipped in test environment.");
}
