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
      const hashedPassword = await this.getHashPassword(password);
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

  async getAll(queryOptions) {
    return this.getPaginated(queryOptions)
      .then((response) => ({ ...response, data: response.data.map((user) => this.userWithoutPassword(user)) }));
  }

  async getById(id) {
    const getOptions = this.cacheGetOptions();
    return mainSession
      .runOne(`MATCH (obj: ${this.name}) WHERE ID(obj) = ${id} return obj`, getOptions)
      .then((user) => this.userWithoutPassword(user));
  }

  async getAllManagers({ skip = 0, limit = 15 } = {}) {
    const managerQuery = { roles: [USER_ROLES.MANAGER] };
    return this.getPaginated({ skip, limit, queryBody: managerQuery })
      .then((response) => ({ ...response, data: response.data.map((user) => this.userWithoutPassword(user)) }));
  }

  async getUser(searchBody, getPassword = false) {
    return mainSession.runOne(
      `MATCH (user:User ${this.stringify(searchBody)}) RETURN user`,
      { cacheKey: this.name }
    )
      .then((user) => (getPassword ? user : this.userWithoutPassword(user)));
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
    const hashPassword = await this.getHashPassword(password);
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
    const user = await this.getUser({ username }, true);
    if (user) {
      const result = await hashCheck(user.password, password);
      if (result) {
        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
          expiresIn: '7d',
        });
        return { user: this.userWithoutPassword(user), token };
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

  async getHashPassword(password) {
    return hashString(password);
  }
}

module.exports = new UserRepository('User', {
  cache: true,
  imageProperty: 'imageUrl',
});
