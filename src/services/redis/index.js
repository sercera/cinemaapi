const Redis = require('ioredis');

const { REDIS_CACHE_CONFIG } = require('../../config/redis');

const cacheClient = new Redis(REDIS_CACHE_CONFIG);

module.exports = {
  cacheClient,
};
