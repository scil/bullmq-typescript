/**
 * 运行( 先编译、创建jobs，最后运行 worker)
 *  pnpm build && pnpm producer && pm2 start ecosystem.config.js --only bull-worker
 */


module.exports = {
  apps: [
    {
      name: 'bull-worker',
      script: './dist/index.js',
      watch: false,
    },
    // pm2 不能运行这种一次行脚本。否则，脚本运行停止后，pm2会不断重新运行之。
    // {
    //   name: 'producer',
    //   script: './dist/producer.js',
    // },
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
