const defaultDateFields = [
  'dateOfBirth',
];

function parseDate(term) {
  const ISODate = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/i;
  const UKDate = /(\d{1,2})(?:[/|-]*)(\d{1,2})(?:[/|-]*)(\d{4})$/i;

  let usedIso = true;
  const parsedDate = ISODate.exec(term) || (() => { usedIso = false; return UKDate.exec(term); })();
  if (!parsedDate || parsedDate.length < 4) {
    return [];
  }

  const dateIndex = usedIso ? 3 : 1;
  const monthIndex = 2;
  const yearIndex = usedIso ? 1 : 3;

  const year = parsedDate[yearIndex];
  const month = parsedDate[monthIndex];
  const date = parsedDate[dateIndex];

  const dateStart = new Date(year, month - 1, date);
  const dateEnd = new Date(dateStart.valueOf());
  dateEnd.setDate(dateEnd.getDate() + 1);
  dateEnd.setSeconds(dateEnd.getSeconds() - 1);

  return [dateStart, dateEnd];
}

const buildRegexQuery = (term, searchableFields) => {
  const [dateBegin, dateEnd] = parseDate(term);
  const isDateTerm = dateBegin && dateEnd;
  const searchRegex = term.split('').map(character => character + '\\s*').join('');
  const filteredFields = isDateTerm ? searchableFields : searchableFields.filter(f => !defaultDateFields.includes(f));

  const queries = filteredFields.map((field) => {
    if (defaultDateFields.includes(field) && isDateTerm) {
      return {
        [field]: {
          $gte: dateBegin,
          $lte: dateEnd,
        },
      };
    }
    return { [field]: { $regex: searchRegex, $options: 'i' } };
  });

  return {
    $or: [...queries],
  };
};

module.exports = buildRegexQuery;
