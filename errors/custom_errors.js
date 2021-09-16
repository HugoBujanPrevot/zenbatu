
/**
 * This module contains a list of custom errors used throughout the program
 */

module.exports.DbOperationError = class DbOperationError extends Error {
    constructor(message) {
        super(message);
        this.name = "DbOperationError";
    }
};

module.exports.DbOperationError = class LoginError extends Error {
    constructor(message) {
        super(message);
        this.name = "LoginError";
    }
};