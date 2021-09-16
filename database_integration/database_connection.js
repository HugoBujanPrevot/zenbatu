
/**
 * This module handles the connection to the remote database.
 * It contains methods to create the connection itself, to
 * start the connection and to check the state of the connection.
 * Once a connection is established, it will keep the connection
 * object in memory for all future queries to the database,
 * providing a wrapper to the mysql npm package.
 * https://www.npmjs.com/package/mysql
 */

// Require the mysql package
const mysql = require("mysql");

// This variable will store the connection once it's established
var dbConnection;


// Creates a connection instance to a database
// and stores it for the rest of the program
module.exports.createConnection = (hostIp, user, password) => {
    // If the ip is not a string, throw an error
    if (typeof hostIp !== "string")
        throw new TypeError(`Expected string for ip, got '${typeof hostIp}' instead:\n\n`, hostIp);

    // If the user is not a string, throw an error
    if (typeof user !== "string")
        throw new TypeError(`Expected string for username, got '${typeof user}' instead`);

    // If the password is not a string, throw an error
    if (typeof password !== "string")
        throw new TypeError(`Expected string for password, got '${typeof password}' instead`);

    // Create the connection object with the given data
    dbConnection = mysql.createConnection({
        host: hostIp,
        user: user,
        password: password,

        // This is required to be able to make single queries with more than one statement in them
        multipleStatements: true
    });
};

// Get the state of the database connection
module.exports.getState = () => {
    if (dbConnection == null || dbConnection.state == null)
        return "disconnected";

    return dbConnection.state;
};

// Attempt to connect to the database and resolve the
// promise if successful; otherwise reject it with an error
module.exports.connect = () => {
    return new Promise((resolve, reject) => {
        dbConnection.connect((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

// end a query to the database and resolve its result,
// or reject the promise with an error, if any
module.exports.query = (...args) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(...args, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};