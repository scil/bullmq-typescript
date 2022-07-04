// https://docs.bullmq.io/guide/workers

import {Job} from "bullmq";
import shell from 'shelljs';
import consola, {LogLevel} from 'consola'

if (!shell.which('git')) {
    shell.echo('Sorry, this script requires git');
    shell.exit(1);
}

/**
 * git status 和 git commit 都忽略的目录
 *
 * 知识：无法排除这样带相对路径的地址（用 ** 也不行)  如
 *  ../Tk.Module.Common/wwwroot/js/chunk-v-file-uploader.js
 *  所以需要在repo 根目录，使用才能完全排除 wwwroot
 */
const ignore = '":(exclude)*wwwroot*"'

// 没有可以提交的文件？那就强行制造无意义提交，以逼迫你必须提交东西。
const fakeFile = '4.code/test/test.md'

export default async function (job: Job) {

    var repo = job.data.repo;
    var demo = job.data.demo;
    consola.level = job.data.logLevel ?? LogLevel.Log

    if (!shell.test('-d', repo)) {
        await job.log(`no exist  ${repo}`);
        return
    }


    await job.log(`Start processing job ${job.id}`);
    consola.log("[[commit-worker]] start with data ", job.data);

    shell.cd(repo);
    exec('git pull', demo)

    // 取出作者 scil 的最近一条 commit
    let commit = exec('git log -1 --author=scil --date=iso', demo)
    let commitTime = 0
    let difMinutes = 999999

    // 如果两小时内有提交纪录 则不用再自动提交
    if (commit) {
        commitTime = commit.split('\n')[2].substr(8)
        difMinutes = ((new Date()).getTime() - (new Date(commitTime)).getTime()) / (1000 * 60)
        consola.debug(`[time] last commitTime is ${commitTime} . ${difMinutes} mins ago`);
        if (difMinutes < 121) {
            consola.trace('  bye')
            return
        }
    }

    // git status 排除目录 wwwroot 
    let status = exec(`git status -s -- ${ignore} `, false)

    // 有可提交的东西 则自动提交
    if (status) {
        consola.debug('[to commit] ', status)
        autoCommit(false, demo)
    } else {
        // 没有可提交的东西 则强行提交
        let info = `${(new Date()).toLocaleString()} - ${commitTime} = ${difMinutes}`
        consola.debug(`[to commit] content ${info} to ${fakeFile} `)
        shell.echo(`${info}`).toEnd(fakeFile);
        autoCommit(true, demo)
    }

}

function autoCommit(fake = false, demo: boolean = false) {
    exec(`git add -- ${ignore}`, demo)
    if (fake)
        exec('git commit -m ". TEST-auto-"', demo)
    else
        exec('git commit -m ". auto-commit"', demo)
}

function exec(cmd: string, demo: boolean) {
    consola.trace(`[exec] ${cmd}`)

    if (demo)
        return '';

    // let result = shell.exec(cmd, {silent: true})
    let result = shell.exec(cmd, {silent: consola.level >= LogLevel.Debug})
    if (result.code !== 0) {
        consola.error(`  Failed ${cmd}`)
        consola.error(`  Error: ${result.stderr}`);

        // 从 shell 官方文档拷贝而来的 没啥用的吧
        // shell.echo(`  Failed ${cmd}`);
        // shell.echo(`  Error: ${result.stderr}`);
        // shell.exit(1);
    }
    return result.stdout
}
