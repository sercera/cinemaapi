const Redis = require('ioredis');

const { REDIS_CACHE_CONFIG, REDIS_QUEUE_CONFIG } = require('../../config/redis');

const cacheClient = new Redis(REDIS_CACHE_CONFIG);
const redisPub = new Redis(REDIS_QUEUE_CONFIG);
const redisSub = new Redis(REDIS_QUEUE_CONFIG);

module.exports = {
  cacheClient,
  redisPub,
  redisSub,
};
