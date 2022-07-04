import { Queue } from "bullmq";
import { commitRepoQueueName ,connection } from "./types";

import cronstrue from 'cronstrue';

/**
 #  second (optional)
 #   minute
 #    hour
 #     day of month
 #      month
 #       day of week
 */
const hours= "10,12,15,17,21";
const cronExp = `0    ${hours}   ?     *     1-5`;

const data = {repo:'K:/repos/inbornking.net'}


const commitRepoQueue = new Queue(commitRepoQueueName, { connection });


async function addJobs() {
  console.log("[producer] Completely obliterates the queue and all of its contents.");
  await commitRepoQueue.obliterate();
  console.log(`    Adding repeat jobs with data supposed to run ${data} ${cronstrue.toString(cronExp)}`);
  await commitRepoQueue.add(`job-${hours}`, data , { repeat: { cron: cronExp  } })
  console.log("    jobs added Done");
  await commitRepoQueue.close();
  console.log("    queue closed");
}

addJobs();
