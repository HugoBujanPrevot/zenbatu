const hasher = require("./hasher");
const logger = require("../logger/logger");
const dbOperations = require("../database_integration/database_operations");
const { LoginError } = require("../errors/custom_errors");


const USERNAME_REGEX = new RegExp(/^\w|\d|_{3, 50}$/);
const PASSWORD_REGEX = new RegExp(/^\w+|\d*|(\!|\@|\#|\$|\%|\&|\*|\-|\_)+{3, 50}$/);

const ACTIVE_SESSIONS = [];


module.exports.logIn = async (username, password) => {
    logger.log(`Attempting to log in with username '${username}'...`);

    if (USERNAME_REGEX.test(username) === false) {
        logger.log(`Username '${username}' failed to pass RegExp ${USERNAME_REGEX}`);
        return Promise.reject(new LoginError(`The username must be between 3 and 50 characters long and can only contain letters, numbers or underscores.`));
    }

    try {
        await exports.checkCredentials(username, password);
        ACTIVE_SESSIONS.push(username);
        return Promise.resolve();
    } catch (err) {
        logger.log(`Error occurred while logging in:`, err);
        return Promise.reject(err);
    }
};

module.exports.checkCredentials = async (username, password) => {
    logger.log(`Checking credentials for sername '${username}'...`);

    try {
        const account = await dbOperations.getAccount(username);
        const isPasswordCorrect = await hasher.comparePasswordToHash(password, account.password);

        if (isPasswordCorrect !== true) {
            logger.log(`Password is incorrect does not match stored hash`);
            return Promise.reject(new LoginError(`The password is incorrect.`));
        }

        logger.log(`Credentials match!`);
        return Promise.resolve();
    } catch (err) {
        logger.log(`Error occurred while checking credentials:`, err);
        return Promise.reject(err);
    }
};

module.exports.logOut = async (username, password) =>
{
    await exports.checkCredentials(username, password);
    ACTIVE_SESSIONS.splice(ACTIVE_SESSIONS.indexOf(username), 1);
};

module.exports.checkIfLoggedIn = async (username, password) =>
{
    await exports.checkCredentials(username, password);
    return ACTIVE_SESSIONS.includes(username);
};

module.exports.isLoggedIn = async (username) =>
{
    return ACTIVE_SESSIONS.includes(username);
};

module.exports.signUp = async (username, password) => {
    logger.log(`Attempting to sign up username '${username}'...`);

    if (USERNAME_REGEX.test(username) === false) {
        logger.log(`Username '${username}' failed to pass RegExp ${USERNAME_REGEX}`);
        return Promise.reject(new LoginError(`The username must be between 3 and 50 characters long and can only contain letters, numbers or underscores.`));
    }

    if (PASSWORD_REGEX.test(password) === false) {
        logger.log(`Password failed to pass RegExp ${PASSWORD_REGEX}`);
        return Promise.reject(new LoginError(`The password must be between 3 and 50 characters long and can contain letters or numbers, as well as at least one special character among the following: !@#$%&*-_`));
    }

    const hashedPassword = await hasher.hash(password);
    return dbOperations.addAccount(username, hashedPassword)
        .then((result) => {
            logger.log(`Signed up successfully!`);
            return Promise.resolve(result);
        });
};