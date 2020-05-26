const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const parser = require('parse-neo4j');
const driver = require('../driver');

const saltRounds = 10;

class UserRepository {
  constructor() {
    this.session = driver.session();
  }

  async register(username, password) {
    const hashPassword = bcrypt.hashSync(password, saltRounds);
    let user = await this.session.run('MATCH (user:User {username: {username}}) RETURN user', {
      username,
    }).then((res) => parser.parse(res)[0]);
    if (user) {
      throw new Error('Username already in use');
    }
    user = await this.session.run('CREATE (user:User {username: {username}, password: {password}}) RETURN user', {
      username,
      password: hashPassword,
    }).then((res) => parser.parse(res)[0]);
    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return { user, token };
  }

  async login(username, password) {
    const user = await this.session.run('MATCH (user:User {username: {username}}) RETURN user', {
      username,
    }).then((res) => parser.parse(res)[0]);
    if (user) {
      const result = await bcrypt.compare(password, user.password);
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

  getAllUsers() {
    return this.session
      .run('MATCH (user: User) return user')
      .then(parser.parse);
  }

  getUser(id) {
    return this.session
      .run(`MATCH (user: User) WHERE ID(user)=${id} RETURN user`)
      .then(parser.parse);
  }

  getLikedMovies(userId) {
    return this.session
      .run(`MATCH (u: User), (m)<-[r: LIKES]-(u) WHERE ID(u) = ${userId} return m`)
      .then(parser.parse);
  }
}

module.exports = new UserRepository();
