const { sendMessageWithResponse, REDIS_QUEUE_CHANNELS } = require('../redis/queue');


async function sendEmail(receiverEmail, subject, html) {
  const from = 'NBP <aleksandar.stankovic6496@gmail.com>';
  const mailOptions = {
    from,
    to: receiverEmail,
    subject,
    html,
  };
  return sendMessageWithResponse(REDIS_QUEUE_CHANNELS.EMAIL_REQUEST, mailOptions);
}

module.exports = {
  sendEmail,
};
