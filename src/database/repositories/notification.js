const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class NotificationRepository extends BaseRepository {
  async notify(userId, body) {
    return mainSession.run(`
    CREATE (n:${this.name} ${this.stringify(body)})
    WITH n
    MATCH (u:User) WHERE ID(u)=${userId}
    CREATE (n)-[:NOTIFY]->(u)
    `);
  }

  async getNotifications(userId) {
    const getOptions = this.cacheGetOptions();
    return mainSession.run(`
      MATCH (n:${this.name})-[:NOTIFY]->(u: User) WHERE ID(u)=${userId}
      RETURN n
      `, getOptions);
  }

  async readNotification(notificationId) {
    const removeOptions = this.cacheRemoveOptions();
    return mainSession.runOne(`
      MATCH (n:${this.name}) WHERE ID(n)=${notificationId}
      SET n += {read: TOBOOLEAN('true')}
      RETURN n
      `, removeOptions);
  }
}

module.exports = new NotificationRepository('Notification', { cache: true });
