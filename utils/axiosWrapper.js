const axios = require('axios');
const { getNamespace } = require('cls-hooked');

const { CLS_NAMESPACE, CLS_REQ_ID_KEY, CLS_UPSTREAM_REQ_ID_KEY } = require('./constants');

module.exports = async ({
  method, url, data, headers,
}) => {
  const session = getNamespace(CLS_NAMESPACE);
  const upstreamreqid = session.get(CLS_UPSTREAM_REQ_ID_KEY) || session.get(CLS_REQ_ID_KEY);
  return axios({
    method,
    url,
    data,
    headers: upstreamreqid ? { ...headers, upstreamreqid } : headers,
  });
};
