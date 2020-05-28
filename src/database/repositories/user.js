const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { USER_ROLES } = require('../../constants/user_roles');

class UserRepository extends BaseRepository {
  async update(id, body) {
    const {
      roles, cinemaId, password, ...filtered
    } = body;
    if (password) {
      const hashedPassword = await hashString(password);
      filtered.password = hashedPassword;
    }
    const removeOptions = this.cacheRemoveOptions();
    return mainSession.runOne(
      `MATCH (obj: ${
        this.name
      }) WHERE ID(obj) = ${id} SET obj += ${this.stringify(
        filtered
      )} return obj`,
      removeOptions
    )
      .then((user) => this.userWithoutPassword(user));
  }

  async getAll(options = {}) {
    const getOptions = this.cacheGetOptions();
    return mainSession
      .run(`MATCH (obj: ${this.name}) return obj`, {
        ...getOptions,
        ...options,
      })
      .then((users) => users.map((user) => this.userWithoutPassword(user)));
  }

  async getAllManagers() {
    return mainSession.run(
      `MATCH (u:User {roles:["${USER_ROLES.MANAGER}"]}) RETURN u`,
      { cacheKey: this.name }
    )
      .then((users) => users.map((user) => this.userWithoutPassword(user)));
  }

  async getUser(searchBody) {
    return mainSession.runOne(
      `MATCH (user:User ${this.stringify(searchBody)}) RETURN user`,
      { cacheKey: this.name }
    )
      .then((user) => this.userWithoutPassword(user));
  }

  async createManager(user) {
    const { cinemaId, password } = user;
    const hashedPassword = await hashString(password);
    const userBody = {
      ...user,
      password: hashedPassword,
      roles: [USER_ROLES.MANAGER],
    };
    return mainSession.runOne(
      `MATCH (c: Cinema) WHERE ID(c)=${cinemaId}
      CREATE (user:User ${this.stringify(userBody)})-[r: IS_MANAGING]->(c)
      RETURN user`,
      { removeCacheKey: this.name }
    )
      .then((user) => this.userWithoutPassword(user));
  }

  async getManagersByCinema(cinemaId) {
    return mainSession.run(
      `MATCH (u:User) WHERE u.cinemaId=${this.stringify(cinemaId)} return u`,
      { cacheKey: this.name }
    )
      .then((users) => users.map((user) => this.userWithoutPassword(user)));
  }

  async register(username, password) {
    let user = await this.getUser({ username });
    if (user) {
      throw new Error('Username already in use');
    }
    const hashPassword = await hashString(password);
    const userBody = {
      username,
      password: hashPassword,
      roles: [USER_ROLES.VISITOR],
    };
    user = this.userWithoutPassword(await this.create(userBody));
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return { user, token };
  }

  async login(username, password) {
    const user = this.userWithoutPassword(await this.getUser({ username }));
    if (user) {
      const result = await hashCheck(user.password, password);
      if (result) {
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        return { user, token };
      }
    }
    throw new Error('Invalid username or password');
  }

  userWithoutPassword(user) {
    if (!user) {
      return user;
    }
    const { password, ...filtered } = user;
    return filtered;
  }
}

module.exports = new UserRepository('User', {
  cache: true,
  imageProperty: 'imageUrl',
});
