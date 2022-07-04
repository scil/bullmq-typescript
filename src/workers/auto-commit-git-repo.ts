// https://docs.bullmq.io/guide/workers

import {Job} from "bullmq";
import shell from 'shelljs';

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
const ignore =  '":(exclude)*wwwroot*"'

// 没有可以提交的文件？那就强行制造无意义提交，以逼迫你必须提交东西。
const fakeFile = 'test/test.md'

export default async function (job: Job) {

    var repo = job.data.repo;
    if (!shell.test('-d', repo)) {
        await job.log(`no exist  ${repo}`);
        return
    }

    await job.log(`Start processing job ${job.id}`  );
    console.log("...");
    console.log("[[auto commit for git repo]] ", job.data);

    shell.cd(repo);
    exec('git pull')

    // 取出作者 scil 的最近一条 commit
    let commit = exec('git log -1 --author=scil --date=iso')
    // 如果两小时内有提交纪录 则不用再自动提交
    if (commit) {
        var commitTime = commit.split('\n')[2].substr(8)
        var difMinutes = ((new Date()).getTime() - (new Date(commitTime)).getTime()) / (1000 * 60)
        console.log(`[time] last commitTime is ${commitTime} . ${difMinutes} mins ago`);
        if (difMinutes < 121) {
            console.log('  bye')
            return
        }
    }

    // git status 排除目录 wwwroot 
    let status = exec(`git status -s -- ${ignore} `)

    // 有可提交的东西 则自动提交
    if (status) {
        console.log('[commit] ', status)
        autoCommit()
    } else {
        // 没有可提交的东西 则强行提交
        let info = `${(new Date()).toLocaleString()} - ${commitTime} = ${difMinutes}`
        console.log('[commit] fake content: ', info)
        shell.echo(`${info}\n`).toEnd(fakeFile);
        autoCommit(true)
    }

}

function autoCommit(fake=false) {
    exec(`git add -- ${ignore}`)
    if (fake)
        exec('git commit -m "."')
    else
        exec('git commit -m ". auto-commit"')
}

function exec(cmd: string) {
    console.log(`[exec] ${cmd}`)

    // let result = shell.exec(cmd, {silent: true})
    let result = shell.exec(cmd, {silent: false})
    if (result.code !== 0) {
        shell.echo(`  Failed ${cmd}`);
        shell.echo(`  Error: ${result.stderr}`);
        shell.exit(1);
    }
    return result.stdout
}
