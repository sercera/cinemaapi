const express = require('express');

const router = express.Router();
const { NotificationRepository } = require('../database/repositories');
const { asyncMiddleware } = require('../middlewares');

router.get('/', asyncMiddleware(getNotifications));
router.post('/:notificationId/read', asyncMiddleware(readNotification));

async function getNotifications(req, res) {
  const { id: userId } = req.user;
  const notifications = await NotificationRepository.getNotifications(userId);
  return res.json(notifications);
}

async function readNotification(req, res) {
  const {
    params: { notificationId },
    user: { id },
  } = req;
  const notification = await NotificationRepository.readNotification(
    id,
    notificationId
  );
  return res.json(notification);
}

module.exports = router;
