import {Queue} from "bullmq";
import {commitRepoQueueName, connection} from "./types";

import cronstrue from 'cronstrue';
import consola, {LogLevel} from 'consola'

/**
 #  second (optional)
 #   minute
 #    hour
 #     day of month
 #      month
 #       day of week
 */
const seconds = ""

const minutes = "0"
// const minutes = "0-59/1"

const hours = "10,12,15,17,21";
// const hours = "1-23";

const weekDays = "1-5"
const cronExp = ` ${seconds} ${minutes} ${hours}   ?     *   ${weekDays}  `;

const data = {
    repo: 'K:/repos/inbornking.net',
    demo: false,
    // logLevel: LogLevel.Log,
    logLevel: LogLevel.Trace,
}


const commitRepoQueue = new Queue(commitRepoQueueName, {connection});


async function addJobs() {
    consola.log("[producer] Completely obliterates the queue and all of its contents.");
    await commitRepoQueue.obliterate();
    consola.log(`  Adding repeat jobs \n    ${cronstrue.toString(cronExp)} \n    with data `,data );

    await commitRepoQueue.add(`auto-commit-job`, data, {repeat: {cron: cronExp}})
    consola.success("  jobs added Done");
    await commitRepoQueue.close();
    consola.success("  queue closed");
}

addJobs();
