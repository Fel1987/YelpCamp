class ExpressError extends Error {
  constructor(message, statusCode) {
    super();
    this.message = message;
    this.status = status;
  }
}

module.exports = ExpressError;
