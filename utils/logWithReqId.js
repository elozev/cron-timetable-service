const logger = require('@profilepensions/logger');
const { getNamespace } = require('cls-hooked');
const { CLS_NAMESPACE, CLS_REQ_ID_KEY, CLS_UPSTREAM_REQ_ID_KEY } = require('./constants');

const logWithReqId = (obj) => {
  return new Proxy(obj, {
    get(target, prop) {
      return new Proxy(target[prop], {
        apply: (applyTarget, thisArg, argumentsList) => {
          const session = getNamespace(CLS_NAMESPACE);
          const reqId = session.get(CLS_REQ_ID_KEY);
          const upstreamReqId = session.get(CLS_UPSTREAM_REQ_ID_KEY);
          const newArgumentsList = [argumentsList[0]];
          const meta = argumentsList[1];
          newArgumentsList.push({
            meta: {
              ...((meta && typeof meta === 'object') && meta),
              ...(reqId && { reqId }),
              ...(upstreamReqId && { upstreamReqId }),
            },
          });
          return target[prop](...newArgumentsList);
        },
      });
    },
  });
};

module.exports = logWithReqId(logger.log);
