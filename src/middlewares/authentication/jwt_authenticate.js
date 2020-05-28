const jwt = require('jsonwebtoken');
const { UserRepository } = require('../../database/repositories');
const { AuthenticateError } = require('../../errors/general');

module.exports = () => async (req, res, next) => {
  try {
    let token;
    try {
      const split = req.headers.authorization.split(' ');
      if (split[0] === 'Bearer') {
        token = split[1];
      }
      if (!token) {
        throw new Error();
      }
    } catch (e) {
      return next(new AuthenticateError('Invalid Authorization header format. Format is "{AUTHORIZATION_TYPE} {TOKEN|API_KEY}". For jwt authorization use Bearer type'));
    }
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserRepository.getById(id);
    if (user) {
      req.user = user;
    } else {
      throw new Error();
    }
  } catch (exception) {
    return next(new AuthenticateError('Invalid token'));
  }
  return next();
};
