const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');
const { hashString, hashCheck } = require('../../common/hashing');

class UserRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (user: User) return user', { cacheKey: this.name });
  }

  getById(id) {
    return mainSession
      .run(`MATCH (user: User) WHERE ID(user)=${id} RETURN user`, { cacheKey: this.name });
  }

  getUserByUsername(username) {
    return mainSession.run(`MATCH (user:User {username: ${username}}) RETURN user`, { cacheKey: this.name });
  }

  create(username, password) {
    return mainSession.run(`CREATE (user:User {username: ${username}, password: ${password}}) RETURN user`, { removeCacheKey: this.name });
  }

  async register(username, password) {
    let user = await this.getUserByUsername(username).then((res) => res[0]);
    if (user) {
      throw new Error('Username already in use');
    }
    const hashPassword = await hashString(password);
    user = await this.create(user, hashPassword).then((res) => res[0]);
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return { user, token };
  }

  async login(username, password) {
    const user = await this.getUserByUsername(username).then((res) => res[0]);
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
    return { error: 'User doesnt exist' };
  }
}

module.exports = new UserRepository('User');
