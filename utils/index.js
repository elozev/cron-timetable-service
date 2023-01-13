const k8s = require('@kubernetes/client-node');
const parser = require('cron-parser');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.BatchV1Api);

const formatCronJob = (cj) => {
  const { name } = cj.metadata;
  const suspended = cj.spec.suspend;
  const { schedule } = cj.spec;

  const interval = parser.parseExpression(schedule);
  const nextScheduledDate = interval.next().toString(); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)

  return {
    name, suspended, schedule, nextScheduledDate,
  };
};

const getAllScheduledInInterval = (start, end, schedule) => {
  const scheduledRuns = [];

  const options = {
    currentDate: start,
    endDate: end,
    iterator: false,
  };

  const interval = parser.parseExpression(schedule, options);
  scheduledRuns.push(interval.prev().toString());

  while (interval.hasNext()) {
    scheduledRuns.push(interval.next().toString());
  }


  return scheduledRuns;
};

const getAllCronJobs = async () => {
  const { body: { items: cronJobs } } = await k8sApi.listCronJobForAllNamespaces();
  return cronJobs.map(formatCronJob);
};

const getCronJobByName = async (name, namespace = 'default') => {
  const { body } = await k8sApi.readNamespacedCronJob(name, namespace);
  return formatCronJob(body);
};

module.exports = {
  getAllCronJobs,
  getCronJobByName,
  getAllScheduledInInterval,
};
