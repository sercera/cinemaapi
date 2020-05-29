const nestedFormDataParse = () => (req, res, next) => {
  const { body } = req;
  if (typeof body === 'object') {
    Object.entries(body).forEach(([key, value]) => {
      try {
        if (typeof value === 'string') {
          req.body[key] = JSON.parse(value);
        } else {
          req.body[key] = value;
        }
      } catch (err) {
        req.body[key] = value;
      }
    });
  }
  next();
};

module.exports = nestedFormDataParse;
