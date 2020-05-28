class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.statusCode = 404;
  }
}

module.exports = {
  NotFoundError,
};
