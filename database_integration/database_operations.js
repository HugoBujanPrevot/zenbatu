
const DbConnectionPrototype = require("./database_connection");
const DbOperationError = require("../errors/db_operation_error");

// Creates a database, provided a connection object and a name
module.exports.createDatabase = (dbConnection, dbName) =>
{
    if (dbConnection instanceof DbConnectionPrototype === false)
        throw new TypeError(`Expected object of type ${dbConnectionPrototype.name}, got ${dbConnection} instead.`);

    if (typeof dbName !== "string")
        throw new TypeError(`Expected string, got '${dbName}' instead.`);

    // Construct query string and pass it to the connection object to query the database
    return dbConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    .catch((err) => Promise.reject(new DbOperationError(`Creating database with name ${dbName} failed\n\n:${err.stack}`)));
};