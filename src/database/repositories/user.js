const jwt = require('jsonwebtoken');
const { mainSession } = require('..');
const { BaseRepository } = require('./base_repo');
const { hashString, hashCheck } = require('../../common/hashing');
const { USER_ROLES } = require('../../constants/user_roles');

class UserRepository extends BaseRepository {
  getAll() {
    return mainSession
      .run('MATCH (user: User) return user', { cacheKey: this.name });
  }

  getById(id) {
    return mainSession
      .runOne(`MATCH (user: User) WHERE ID(user)=${id} RETURN user`, { cacheKey: this.name });
  }

  getUserByUsername(username) {
    return mainSession.runOne(`MATCH (user:User {username: ${username}}) RETURN user`, { cacheKey: this.name });
  }

  create(username, password, roles = []) {
    return mainSession.runOne(`CREATE (user:User {username: ${username}, password: ${password},roles:[${roles.join(',')}]}) RETURN user`, { removeCacheKey: this.name });
  }

  async register(username, password) {
    let user = await this.getUserByUsername(username);
    if (user) {
      throw new Error('Username already in use');
    }
    const hashPassword = await hashString(password);
    user = await this.create(user, hashPassword, [USER_ROLES.VISITOR]);
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return { user, token };
  }

  async login(username, password) {
    const user = await this.getUserByUsername(username);
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
