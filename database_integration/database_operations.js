
const DbConnectionPrototype = require("./database_connection");
const DbOperationError = require("../errors/db_operation_error");

// Creates a database, provided a connection object and a name
module.exports.createDatabase = (dbConnection, dbName) =>
{
    // Check if dbConnection object is the right type
    if (dbConnection instanceof DbConnectionPrototype === false)
        throw new TypeError(`Expected object of type ${dbConnectionPrototype.name}, got ${dbConnection} instead.`);

    // Check that the given dbName is indeed a string
    if (typeof dbName !== "string")
        throw new TypeError(`Expected string, got '${dbName}' instead.`);

    // Construct query string and pass it to the connection object to query the database
    return dbConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    .catch((err) => Promise.reject(new DbOperationError(`Creating database with name ${dbName} failed\n\n:${err.stack}`)));
};