const mysql = require("mysql");

var dbConnection;


/** Creates a connection instance to a database and
 * stores it for the rest of the program
 */
module.exports.createConnection = (hostIp, user, password) => {
    if (typeof hostIp !== "string")
        throw new TypeError(`Expected string for ip, got '${typeof hostIp}' instead:\n\n`, hostIp);

    if (typeof user !== "string")
        throw new TypeError(`Expected string for username, got '${typeof user}' instead`);

    if (typeof password !== "string")
        throw new TypeError(`Expected string for password, got '${typeof password}' instead`);

    dbConnection = mysql.createConnection({
        host: hostIp,
        user: user,
        password: password,

        // This is required to be able to make single queries with more than one statement in them
        multipleStatements: true
    });
};

/** Attempt to connect to the database and resolve the
 * promise if successful; otherwise reject it with an error
 */
module.exports.connect = () => {
    return new Promise((resolve, reject) => {
        dbConnection.connect((err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

/** Send a query to the database and resolve its result,
 * or reject the promise with an error, if any.
 */
module.exports.query = (...args) => {
    return new Promise((resolve, reject) => {
        dbConnection.query(...args, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
};