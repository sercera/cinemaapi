
const { AuthorizeError } = require('../../errors/general');

/**
 *
 * @param {string|string[]} userRoles
 */
function userRoleAuth(userRoles) {
  if (typeof userRoles === 'string') {
    userRoles = [userRoles];
  }
  return (req, res, next) => {
    const { user } = req;
    if (user && user.roles.some((role) => userRoles.includes(role))) {
      return next();
    }
    return next(new AuthorizeError('User not authorized'));
  };
}

module.exports = userRoleAuth;
