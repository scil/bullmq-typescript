/**
 * 运行(先创建jobs)
 *  pnpm start:producer && pm2 start ecosystem.config.js --only worker
 *
 * 或
 *
 *  pm2 start ecosystem.config.js --only "dev:worker,dev:producer"
 *  这里的 dev 命令带 watch 功能。为什么不使用pm2的watch？因为 package.json 中的 tsc-watch 可自动编译 ts 文件
 */


module.exports = {
  apps: [
    {
      name: 'worker',
      script: './dist/index.js',
      watch: false,
    },
    // pm2 不能运行这种一次行脚本。否则，脚本运行停止后，pm2会不断重新运行之。
    // {
    //   name: 'producer',
    //   script: './dist/producer.js',
    // },
    {
      name: 'dev:worker',
      script: 'npm',
      args:'run dev:worker',
    },
    {
      name: 'dev:producer',
      script: 'npm',
      args:'run dev:producer',
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
