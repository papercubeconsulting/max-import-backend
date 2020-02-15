module.exports = {
  apps: [
    {
      name: 'API',
      script: 'app.js',
      cwd: '/root/booking-lae/Back',
      instances: 2,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instance_var: 'INSTANCE_ID',
      env: {
        NODE_ENV: 'development',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
    {
      name: 'Booking',
      script: 'server',
      cwd: '/root/booking-lae/Front/booking-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instance_var: 'INSTANCE_ID',
      // env: {
      //     NODE_ENV: 'development',
      // },
      // env_production: {
      //     NODE_ENV: 'production',
      // },
    },
    {
      name: 'Sales',
      script: 'server',
      cwd: '/root/refactor/Front/booking-app',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      instance_var: 'INSTANCE_ID',
      // env: {
      //     NODE_ENV: 'development',
      // },
      // env_production: {
      //     NODE_ENV: 'production',
      // },
    },
  ],
};
