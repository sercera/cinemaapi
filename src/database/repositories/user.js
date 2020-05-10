const bcrypt = require('bcrypt');
const randomstring = require('randomstring');
const parser = require('parse-neo4j');
const driver = require('../driver');

const saltRounds = 10;

class UserRepository {
  constructor() {
    this.session = driver.session();
  }

  register(username, password) {
    const hashPassword = bcrypt.hashSync(password, saltRounds);
    return this.session.run('MATCH (user:User {username: {username}}) RETURN user', {
      username,
    })
      .then((results) => {
        if (results.records.length !== 0) {
          return {
            username: 'username already in use',
            status: 400,
          };
        }
        return this.session.run('CREATE (user:User {username: {username}, password: {password}, api_key: {api_key}}) RETURN user', {
          username,
          password: hashPassword,
          api_key: randomstring.generate({
            length: 20,
            charset: 'hex',
          }),
        }).then((results) => results.records[0].get('user')).catch((e) => console.log(e));
      });
  }

  login(username, password) {
    return this.session.run('MATCH (user:User {username: {username}}) RETURN user', {
      username,
    })
      .then(async (results) => {
        if (results.records.length === 0) {
          return {
            message: 'username does not exist',
            status: 400,
          };
        }
        const dbUser = results.records[0].get('user');
        const result = await bcrypt.compare(password, dbUser.properties.password);
        if (result) {
          return { token: dbUser.properties.api_key };
        }
        return {
          message: 'wrong password',
          status: 400,
        };
      });
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
}

module.exports = new UserRepository();
