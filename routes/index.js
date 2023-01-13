const express = require('express');
const moment = require('moment');
const { get } = require('lodash');
const { getAllCronJobs, getAllScheduledInInterval, getCronJobByName } = require('../utils');
const { sendMetric } = require('../utils/pubsub');

const router = express.Router();

router.get('/', async (req, res) => {
  await sendMetric(true, 'example-action');
  return res.send({ Hello: 'World' });
});

router.get('/cron', async (req, res) => {
  const crons = await getAllCronJobs();
  return res.json(crons);
});

router.get('/cron/:name', async (req, res) => {
  const startTime = get(req, 'query.startTime', moment.utc().toISOString());
  const endTime = get(req, 'query.endTime', moment().utc().endOf('day').toISOString());

  const name = get(req, 'params.name', null);
  const namespace = get(req, 'query.namespace', 'default');

  if (!name) {
    return res.status(400).send('/cron/:name cron name is required.');
  }

  const cron = await getCronJobByName(name, namespace);
  cron.scheduledTimestamps = getAllScheduledInInterval(startTime, endTime, cron.schedule);

  return res.json(cron);
});

module.exports = router;