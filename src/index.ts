import { Worker, QueueScheduler } from "bullmq";
import { commitRepoQueueName ,connection } from "./types";


const commitRepoWorker = new Worker(commitRepoQueueName, `${__dirname}/workers/auto-commit-worker.js`, {
  connection,
});

const commitRepoScheduler = new QueueScheduler(commitRepoQueueName, {
  connection,
});

process.on("SIGTERM", async () => {
  console.info("SIGTERM signal received: closing queues");

  await commitRepoWorker.close();
  await commitRepoScheduler.close();

  console.info("All closed");
});
