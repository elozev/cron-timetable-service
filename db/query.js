const buildRegexQuery = require('./buildRegexQuery.js');

function findModelByRegex(Model, keyword, pageSize, cb) {
  const query = buildRegexQuery(keyword, Model.getSearchableFields());
  Model.find(query)
    .skip(0)
    .limit(pageSize)
    .exec(cb);
}

function findModelByKeyword(Model, keyword, pageSize, cb) {
  const query = { $text: { $search: keyword } };
  Model.find(query, { score: { $meta: 'textScore' } })
    .skip(0)
    .limit(pageSize)
    .exec(cb);
}

module.exports = {
  findModelByRegex,
  findModelByKeyword,
};
