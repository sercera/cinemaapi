const fs = require('fs');
const { mainSession } = require('..');

class BaseRepository {
  /**
   *
   * @param {string} modelName
   * @param {{imageProperty?:string,cache?:boolean,searchTermProp:string}|undefined} options
   */
  constructor(modelName, options = {}) {
    this.name = modelName;
    this.options = options;
  }

  async getAll(options = {}) {
    const getOptions = this.cacheGetOptions();
    return mainSession.run(`MATCH (obj: ${this.name}) return obj`, {
      ...getOptions,
      ...options,
    });
  }

  async getPaginated({
    skip = 0, limit = 15, queryBody, orderBy, orderDir = 'ASC', searchTerm,
  }, options = {}) {
    const { searchTermProp } = this.options;
    const getOptions = this.cacheGetOptions();
    const objectQuery = queryBody ? this.stringify(queryBody) : '';
    const orderQuery = orderBy ? `ORDER BY obj.${orderBy} ${orderDir.toUpperCase() === 'DESC' ? 'DESC' : 'ASC'}` : '';
    let likeQuery = '';
    if (searchTermProp) {
      likeQuery = searchTerm ? `WHERE toLower(obj.${searchTermProp}) =~ '.*${searchTerm.toLowerCase()}.*'` : '';
    }
    return mainSession.runOne(
      `MATCH (obj:${this.name} ${objectQuery}) ${likeQuery}
    WITH count(*) AS cnt
    MATCH 
    (obj:${this.name} ${objectQuery}) ${likeQuery}
    WITH obj, cnt ${orderQuery} SKIP ${skip} LIMIT ${limit}
    RETURN 
    { data:collect(obj), total: cnt, limit: ${limit}, skip: ${skip} } AS objects`,
      {
        ...getOptions,
        ...options,
      }
    );
  }

  async getById(id) {
    const getOptions = this.cacheGetOptions();
    return mainSession.runOne(
      `MATCH (obj: ${this.name}) WHERE ID(obj) = ${id} return obj`,
      getOptions
    );
  }

  async update(id, body) {
    const removeOptions = this.cacheRemoveOptions();
    return mainSession.runOne(
      `MATCH (obj: ${
        this.name
      }) WHERE ID(obj) = ${id} SET obj += ${this.stringify(body)} return obj`,
      removeOptions
    );
  }

  async create(body) {
    const removeOptions = this.cacheRemoveOptions();
    return mainSession.runOne(
      `CREATE (obj: ${this.name} ${this.stringify(body)}) return obj`,
      removeOptions
    );
  }

  async createMany(bodies) {
    const removeOptions = this.cacheRemoveOptions();
    const query = bodies
      .map(
        (body, index) => `(obj${index}: ${this.name} ${this.stringify(body)})`
      )
      .join(', ');
    return mainSession.run(`CREATE ${query}`, removeOptions);
  }

  async deleteById(id) {
    const { imageProperty } = this.options;
    const removeOptions = this.cacheRemoveOptions();
    if (imageProperty) {
      const imageUrl = await mainSession.runOne(
        `MATCH (obj: ${this.name}) WHERE ID(obj) = ${id}
      WITH obj, obj.${imageProperty} AS imageUrl
      DETACH DELETE obj
      RETURN imageUrl`,
        removeOptions
      );
      if (imageUrl) {
        this.removeFile(imageUrl);
      }
    } else {
      await mainSession.runOne(
        `MATCH (obj: ${this.name}) WHERE ID(obj) = ${id}
      DETACH DELETE obj`,
        removeOptions
      );
    }
    return {
      id,
    };
  }

  cacheGetOptions() {
    const { cache } = this.options;
    return cache ? { cacheKey: this.name } : {};
  }

  cacheRemoveOptions() {
    const { cache } = this.options;
    return cache ? { removeCacheKey: this.name } : {};
  }

  stringify(data) {
    switch (typeof data) {
      case 'string':
        try {
          const jsonData = JSON.parse(data);
          return this.stringify(jsonData);
        } catch (err) {
          return `"${data.replace(/["\\]/g, (char) => `\\${char}`)}"`;
        }
      case 'object': {
        if (Array.isArray(data)) {
          let body = '[';
          const arrayData = data.map((arrayValue) => this.stringify(arrayValue));
          body += arrayData.join(',');
          body += ']';
          return body;
        }
        let body = '{';
        const objectData = [];
        Object.entries(data).forEach(([key, value]) => {
          const objectValue = this.stringify(value);
          if (objectValue !== undefined) {
            objectData.push(`${key}:${objectValue}`);
          }
        });
        body += objectData.join(',');
        body += '}';
        return body;
      }
      default:
        return data;
    }
  }

  async removeFile(imageUrl) {
    const imageRelativePath = imageUrl.replace(process.env.HOST, '.');
    return new Promise((resolve) => fs.unlink(imageRelativePath, (err) => {
      if (err) {
        console.error(`Failed removing file: ${imageUrl}`);
        return resolve(false);
      }
      return resolve(true);
    }));
  }
}

module.exports = {
  BaseRepository,
};
