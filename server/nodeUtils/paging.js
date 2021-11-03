const paging = (page, perPage, results) => ({
  page: parseInt(page, 10),
  totalPages: Math.ceil(results / perPage),
  totalResults: results,
});

module.exports = {
  paging,
};
