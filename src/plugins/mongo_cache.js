// eslint-disable-next-line no-unused-vars
const neo4j = require('neo4j-driver');
const parser = require('parse-neo4j');

const { cacheClient } = require('../services/redis');

/**
 *
 * @param {neo4j.Session} session
 *
 * @returns {{run:(query:string,options?:{cacheKey:string,removeCacheKey:string[]|string,customKey?:string})=>Promise<any>}}
 */
function mongoCachePlugin(session) {
  const { run } = session;

  session.run = async function (query, options = {}) {
    const { cacheKey, customKey } = options;
    let { removeCacheKey } = options;
    if (removeCacheKey) {
      if (typeof removeCacheKey === 'string' && customKey) {
        await cacheClient.hdel(removeCacheKey, customKey);
      } else {
        if (typeof removeCacheKey === 'string') {
          removeCacheKey = [removeCacheKey];
        }
        await cacheClient.del(...removeCacheKey);
      }
    }
    if (!cacheKey) {
      return run.apply(this, [query]).then(parser.parse);
    }

    const key = customKey || query;

    const cacheValue = await cacheClient.hget(cacheKey, key);
    if (cacheValue) {
      return JSON.parse(cacheValue);
    }
    const result = await run.apply(this, [query]).then(parser.parse);

    cacheClient.hset(cacheKey, key, JSON.stringify(result));
    return result;
  };
  return session;
}

module.exports = {
  mongoCachePlugin,
};
