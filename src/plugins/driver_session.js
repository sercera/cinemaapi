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
      run:(query:string,options?:{cacheKey:string,removeCacheKey:string[]|string,customKey?:string,cacheExp?:number})=>Promise<any[]>,
      runOne:(query:string,options?:{cacheKey:string,removeCacheKey:string[]|string,customKey?:string,cacheExp?:number})=>Promise<any>
    }
  }
 */
function driverSessionPlugin(driver) {
  const SessionWrapper = {
    run: defaultRun(false, driver),
    runOne: defaultRun(true, driver),
  };

  return SessionWrapper;
}

/**
 *
 * @param {boolean} isSingle
 * @param {neo4j.Driver} driver
 */
function defaultRun(isSingle, driver) {
  return async (query, options = {}) => {
    const session = driver.session();
    const {
      cacheKey, customKey, cacheExp,
    } = options;
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
      let result = await session.run(query).then(parser.parse);
      session.close();
      result = result && isSingle ? result[0] : result;
      return result;
    }

    const key = customKey || query;

    const cacheValue = await cacheClient.hget(cacheKey, key);
    if (cacheValue) {
      return JSON.parse(cacheValue);
    }
    let result = await session.run(query).then(parser.parse);
    session.close();
    result = result && isSingle ? result[0] : result;

    cacheClient.hset(cacheKey, key, JSON.stringify(result));
    if (cacheExp) {
      cacheClient.expire(cacheKey, cacheExp);
    }
    return result;
  };
}
module.exports = {
  driverSessionPlugin,
};
