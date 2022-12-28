function filterObject(objBody, ...filterBody) {
  const filter = {};
  Object.keys(objBody).forEach((el) => {
    if (filterBody.includes(el)) {
      filter[el] = objBody[el];
    }
  });
  return filter;
}

const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

module.exports = {
  filterObject,
  catchAsync,
};
