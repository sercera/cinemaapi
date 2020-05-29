const express = require('express');

const router = express.Router();
const {
  NotificationRepository,
} = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.post('/user/:userId', asyncMiddleware(notifyUser));
router.get('/user/:userId', asyncMiddleware(getNotifications));
router.get('/:notificationId/read', asyncMiddleware(readNotification));

async function notifyUser(req, res) {
  const { params: { userId }, body } = req;
  await NotificationRepository.notify(userId, body);
  return res.json({ message: 'Notified' });
}

async function getNotifications(req, res) {
  const { userId } = req.params;
  const notifications = await NotificationRepository.getNotifications(userId);
  return res.json(notifications);
}

async function readNotification(req, res) {
  const { notificationId } = req.params;
  const notification = await NotificationRepository.readNotification(notificationId);
  return res.json(notification);
}

module.exports = router;
