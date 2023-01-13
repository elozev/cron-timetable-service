const uuid = require('uuid');
const { createNamespace, getNamespace } = require('cls-hooked');
const { CLS_NAMESPACE, CLS_REQ_ID_KEY, CLS_UPSTREAM_REQ_ID_KEY } = require('./constants');

const session = createNamespace(CLS_NAMESPACE);

const attachContext = async (req, res, next) => {
  await session.run(() => next());
};

const setRequestId = (req, res, next) => {
  const reqId = uuid.v4();
  const upstreamReqId = req.get('upstreamreqid');
  session.set(CLS_REQ_ID_KEY, reqId);
  if (upstreamReqId) session.set(CLS_UPSTREAM_REQ_ID_KEY, upstreamReqId);
  return next();
};

const getUpstreamRequestIdForHeader = () => {
  const _session = getNamespace(CLS_NAMESPACE);
  const reqId = _session.get(CLS_REQ_ID_KEY);
  const upstreamReqId = _session.get(CLS_UPSTREAM_REQ_ID_KEY);
  return upstreamReqId || reqId;
};

module.exports = {
  attachContext, setRequestId, getUpstreamRequestIdForHeader,
};
