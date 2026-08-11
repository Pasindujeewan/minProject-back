import cron from "node-cron";
import { checkAssignmentPriorities } from "../services/checkAssignmentPriorities.js";

export function startPriorityScheduler() {
  cron.schedule("0 * * * *", async () => {
    await checkAssignmentPriorities();
  });

  console.log("Priority scheduler started");
}
