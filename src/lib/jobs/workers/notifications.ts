/**
 * Notification worker — processes push notification jobs
 */

import { registerWorker, type JobData } from "../queue";
import { sendPushToUser } from "@/lib/notifications/push";

export function registerNotificationWorker(): void {
  registerWorker("notification:send", async (data) => {
    const { userId, title, body, url } = data;

    await sendPushToUser(userId, {
      title,
      body,
      url,
    });
  });
}
