const k8s = require('@kubernetes/client-node');
const parser = require('cron-parser');

const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const k8sApi = kc.makeApiClient(k8s.BatchV1Api);

const getAllCronJobs = async () => {
  const { body: { items: cronJobs } } = await k8sApi.listCronJobForAllNamespaces();
  console.log(cronJobs[0]);

  const trimmedCronJobs = cronJobs.map((cj) => {
    const { name } = cj.metadata;
    const suspended = cj.spec.suspend;
    const { schedule } = cj.spec;

    const interval = parser.parseExpression(schedule);
    const nextScheduledDate = interval.next().toString(); // Sat Dec 29 2012 00:42:00 GMT+0200 (EET)

    return {
      name, suspended, schedule, nextScheduledDate,
    };
  });


  return trimmedCronJobs;
};

module.exports = {
  getAllCronJobs,
};
