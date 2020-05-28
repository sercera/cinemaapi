class AuthenticateError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 401;
  }
}

module.exports = {
  AuthenticateError,
};
