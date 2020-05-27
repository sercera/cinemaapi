const Redis = require('ioredis');

const { initializeEnvironment } = require('../common/environment');

initializeEnvironment();

const { REDIS_CACHE_CONFIG } = require('../config/redis');

const client = new Redis(REDIS_CACHE_CONFIG);

client
  .flushdb()
  .then(() => {
    console.log('Cache cleared');
    process.exit();
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
