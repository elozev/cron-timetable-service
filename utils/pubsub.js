const { PubSub } = require('@google-cloud/pubsub');
const { log } = require('@profilepensions/logger');
const { enabled, metricTopic } = require('config').pubSub;

const serviceName = 'cron-timetable-service';
const pubsub = new PubSub();

const send = async (topic, data) => {
  const dataBuffer = Buffer.from(data);

  if (!topic) {
    log.debug(`Would publish: ${data}`);
    return Promise.resolve();
  }

  log.debug(`Publishing: ${data}`);
  return pubsub
    .topic(topic)
    .publish(dataBuffer)
    .catch((err) => {
      log.error(`Error while publishing: ${err} ${data}`);
    });
};

const sendMetric = async (success, action) => {
  if (!enabled) {
    log.info(`PubSub is not enabled in ${serviceName}`);
    return;
  }
  if (action) {
    await send(metricTopic, `${serviceName},action=${action} success=${success} ${new Date().getTime()}`);
  } else {
    await send(metricTopic, `${serviceName} success=${success} ${new Date().getTime()}`);
  }
};

module.exports = { sendMetric };
