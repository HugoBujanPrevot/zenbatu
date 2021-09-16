
/**
 * This module contains all the necessary methods to log in or sign up a user,
 * as well as to check credentials and storing active sessions.
 */

// Required modules to work with
const hasher = require("./hasher");
const logger = require("../logger/logger");
const idGenerator = require("../asset_manager/id_generator");
const dbOperations = require("../database_integration/database_operations");
const { LoginError } = require("../errors/custom_errors");

// Username and password regexps to ensure they are in the accepted form
const USERNAME_REGEX = new RegExp(/^\w|\d|_{3, 50}$/);
const PASSWORD_REGEX = new RegExp(/^\w+|\d*|(\!|\@|\#|\$|\%|\&|\*|\-|\_)+{3, 50}$/);

// Active session ids will be stored here
const ACTIVE_SESSIONS = [];


// Logs a user in after checking the username and the password against the stored ones
module.exports.logIn = async (username, password) => {
    logger.log(`Attempting to log in with username '${username}'...`);

    // Check that username shape is correct
    if (USERNAME_REGEX.test(username) === false) {
        logger.log(`Username '${username}' failed to pass RegExp ${USERNAME_REGEX}`);
        return Promise.reject(new LoginError(`The username must be between 3 and 50 characters long and can only contain letters, numbers or underscores.`));
    }

    try {
        // Check credentials in the database to make sure they match. If they don't,
        // an error will be thrown and caught in the catch block below
        await exports.checkCredentials(username, password);

        // Create and store a session id after successfully checking credentials
        const sessionId = idGenerator.generateId();
        ACTIVE_SESSIONS.push({ username, sessionId });

        // Return the session id to pass it to the front-end
        return Promise.resolve(sessionId);
    } catch (err) {
        logger.log(`Error occurred while logging in:`, err);
        return Promise.reject(err);
    }
};

// Checks credentials in the database and throws error if they don't match
module.exports.checkCredentials = async (username, password) => {
    logger.log(`Checking credentials for sername '${username}'...`);

    try {
        // Fetch the account data that corresponds to the given username
        const account = await dbOperations.getAccount(username);

        // Use the bcrypt module to compare the password string to the stored hash in the database
        const isPasswordCorrect = await hasher.comparePasswordToHash(password, account.password);

        // If the password is not correct, throw a LoginError
        if (isPasswordCorrect !== true) {
            logger.log(`Password is incorrect does not match stored hash`);
            return Promise.reject(new LoginError(`The password is incorrect.`));
        }

        // Otherwise resolve the function successfully
        logger.log(`Credentials match!`);
        return Promise.resolve();
    } catch (err) {
        logger.log(`Error occurred while checking credentials:`, err);
        return Promise.reject(err);
    }
};

// Returns a session object if one is found that matches the provided session id
module.exports.getSession = (sessionId) =>
{
    const loggedSession = ACTIVE_SESSIONS.find((session) => session.sessionId === sessionId);

    if (loggedSession == null)
        return null;

    return loggedSession;
};

// Find the username of a session through the session id
module.exports.getUsername = (sessionId) =>
{
    const loggedSession = exports.getSession(sessionId);

    if (loggedSession == null || loggedSession.username == null)
        return null;

    return loggedSession.username;
};

// Log out an active session by deleting the stored object
module.exports.logOut = (sessionId) =>
{
    if (exports.isSessionActive(sessionId) === false)
        return;

    ACTIVE_SESSIONS.forEach((session, i) =>
    {
        if (session[i].sessionId === sessionId)
            ACTIVE_SESSIONS.splice(i, 1);
    })
};

// Check if a session exists with a given id
module.exports.isSessionActive = (sessionId) =>
{
    return exports.getSession(sessionId) != null;
};

// Check by username if a session exists and is thus logged in
module.exports.isUsernameLoggedIn = (username) =>
{
    return ACTIVE_SESSIONS.find((session) => session.username === username) != null;
};

// Creates a new record in the database for a new user account
module.exports.signUp = async (username, password) => {
    logger.log(`Attempting to sign up username '${username}'...`);

    // Test that the username provided has the right pattern with our regexp or throw an error
    if (USERNAME_REGEX.test(username) === false) {
        logger.log(`Username '${username}' failed to pass RegExp ${USERNAME_REGEX}`);
        return Promise.reject(new LoginError(`The username must be between 3 and 50 characters long and can only contain letters, numbers or underscores.`));
    }

    // Test that the password provided has the right pattern with our regexp or throw an error
    if (PASSWORD_REGEX.test(password) === false) {
        logger.log(`Password failed to pass RegExp ${PASSWORD_REGEX}`);
        return Promise.reject(new LoginError(`The password must be between 3 and 50 characters long and can contain letters or numbers, as well as at least one special character among the following: !@#$%&*-_`));
    }

    // Use the bcrypt module to hash and salt the user-created password
    const hashedPassword = await hasher.hash(password);

    // Store the account with the username and the hashed password (NOT the actual user password)
    return dbOperations.addAccount(username, hashedPassword)
        .then((result) => {
            logger.log(`Signed up successfully!`);
            return Promise.resolve(result);
        });
};