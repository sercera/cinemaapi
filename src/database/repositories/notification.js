const moment = require('moment');
const { BaseRepository } = require('./base_repo');
const { mainSession } = require('..');

class NotificationRepository extends BaseRepository {
  getCustomKey(userId) {
    return `user-notifications-${userId}`;
  }

  async create(userId, text, link) {
    const body = {
      text,
      link,
      createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
      read: false,
    };
    return mainSession.run(
      `
    CREATE (n:${this.name} ${this.stringify(body)})
    WITH n
    MATCH (u:User) WHERE ID(u)=${userId}
    CREATE (n)-[:NOTIFY]->(u)
    `,
      { removeCacheKey: this.getCustomKey(userId) }
    );
  }

  async getNotifications(userId) {
    return mainSession.runOne(
      `
      MATCH (n:${this.name})-[:NOTIFY]->(u: User) WHERE ID(u)=${userId} AND n.read = false
      WITH count(*) as unreadCount
      MATCH (n:${this.name})-[:NOTIFY]->(u: User)  WHERE ID(u)=${userId} 
      RETURN unreadCount, collect(n) as notifications
      `,
      { cacheKey: this.getCustomKey(userId) }
    );
  }

  async readNotification(userId, notificationId) {
    return mainSession.runOne(
      `
      MATCH (n:${this.name})-[:NOTIFY]->(u:User) WHERE ID(n)=${notificationId} and ID(u) = ${userId}
      SET n += {read: TOBOOLEAN('true')}
      RETURN n
      `,
      { removeCacheKey: this.getCustomKey(userId) }
    );
  }
}

module.exports = new NotificationRepository('Notification', { cache: true });
