import { CronJob } from "cron";
import { clearBacklogs } from "../routes/mq/handlers/setMessageStatus";

export const WorkersBacklogJob = (cronExp, timezone) => {
  const testJob = new CronJob(cronExp, () => clearBacklogs("test"), {
    timezone,
  });

  testJob.start();

  // Live
  const liveJob = new CronJob(cronExp, () => clearBacklogs("live"), {
    timezone,
  });

  liveJob.start();
};
