

module.exports = class DbOperationError extends Error {
    constructor(message) {
        super(message);
        this.name = "DbOperationError";
    }
};

module.exports = class LoginError extends Error {
    constructor(message) {
        super(message);
        this.name = "LoginError";
    }
};