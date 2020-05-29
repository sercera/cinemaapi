// eslint-disable-next-line no-unused-vars
const neo4j = require('neo4j-driver');
const parser = require('parse-neo4j');

const { cacheClient } = require('../services/redis');

/**
 *
 * @param {neo4j.Session} session
 *
 * @returns {
    {
      run:(query:string,options?:{cacheKey:string,removeCacheKey:string[]|string,customKey?:string})=>Promise<any[]>,
      runOne:(query:string,options?:{cacheKey:string,removeCacheKey:string[]|string,customKey?:string})=>Promise<any>
    }
  }
 */
function driverSessionPlugin(session) {
  const { run } = session;

  session.run = defaultRun(session, false, run);
  session.runOne = defaultRun(session, true, run);
  return session;
}


function defaultRun(session, isSingle, run) {
  return async (query, options = {}) => {
    const {
      cacheKey, customKey, limit, skip,
    } = options;
    if (skip) {
      query += ` SKIP ${skip}`;
    }
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
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
    if (!cacheKey || process.env.USE_CACHE === 'false') {
      let result = await run.apply(session, [query]).then(parser.parse);
      result = result && isSingle ? result[0] : result;
      return result;
    }

    const key = customKey || query;

    const cacheValue = await cacheClient.hget(cacheKey, key);
    if (cacheValue) {
      return JSON.parse(cacheValue);
    }
    let result = await run.apply(session, [query]).then(parser.parse);
    result = result && isSingle ? result[0] : result;

    cacheClient.hset(cacheKey, key, JSON.stringify(result));
    return result;
  };
}
module.exports = {
  driverSessionPlugin,
};
