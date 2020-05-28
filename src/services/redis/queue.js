const EventEmitter = require('events');
const md5 = require('md5');

const { REDIS_QUEUE_CHANNELS } = require('../../constants/redis_channels');
const { safeJsonParse } = require('../../common/json_parse');

const { redisPub, redisSub } = require('.');

const emitter = new EventEmitter();

redisSub.on('message', (channel, data) => {
  const parsedData = safeJsonParse(data);
  emitter.emit(channel, parsedData);
});

redisSub.subscribe(...Object.values(REDIS_QUEUE_CHANNELS));

async function sendMessageWithResponse(
  channel,
  data = {},
  timeout = 30000
) {
  const messageIdentifier = md5(
    JSON.stringify(data)
        + new Date().getUTCMilliseconds()
        + Math.random() * 10e6
  );
  const responseChannel = `${channel}-${messageIdentifier}`;
  const responsePromise = new Promise((resolve, reject) => {
    const handler = (responseData) => {
      redisSub.unsubscribe(responseChannel);
      clearTimeout(failTimeout);
      return resolve(responseData);
    };
    emitter.once(responseChannel, handler);
    redisSub.subscribe(responseChannel);
    const failTimeout = setTimeout(() => {
      redisSub.unsubscribe(responseChannel);
      emitter.removeListener(responseChannel, handler);
      return reject('Timeout');
    }, timeout);
  });
  return Promise.all([sendMessage(channel, data, messageIdentifier), responsePromise]);
}

async function sendMessage(channel, data, identifier) {
  if (!identifier) {
    identifier = md5(
      JSON.stringify(data)
            + new Date().getUTCMilliseconds()
            + Math.random() * 10e6
    );
  }
  return redisPub.publish(channel, JSON.stringify({ id: identifier, data }));
}

module.exports = {
  REDIS_QUEUE_CHANNELS,
  sendMessageWithResponse,
  sendMessage,
};
