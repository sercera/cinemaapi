class AuthorizeError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 403;
  }
}

module.exports = {
  AuthorizeError,
};
