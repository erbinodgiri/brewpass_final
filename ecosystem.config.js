// PM2 config — used to keep the app running on VPS
module.exports = {
  apps: [{
    name: 'brewpass',
    script: 'node_modules/.bin/next',
    args: 'start',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    }
  }]
}
