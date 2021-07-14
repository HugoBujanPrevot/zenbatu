
module.exports = class DbOperationError extends Error
{
  constructor(message)
  {
    super(message);
    this.name = "DbOperationError";
  }
};