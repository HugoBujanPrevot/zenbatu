

const DbOperationError = require("../errors/db_operation_error");

const DB_NAME = "Zenbatu";
const ASSET_TABLE = "Assets";
const ASSET_LOCATION_TABLE = "AssetLocation";
const ASSET_TYPE_TABLE = "AssetType";
const ASSET_PURCHASE_TABLE = "AssetPurchase";
const SITES_TABLE = "Sites";
const LOCATIONS_TABLE = "Locations";
const CATEGORIES_TABLE = "Categories";


module.exports.initializeDb = (dbConnection) =>
{
    return _createDatabase(dbConnection, DB_NAME)
    .then(() => _useDatabase(dbConnection, DB_NAME))
    .then(() => _createTable(dbConnection, ASSET_TABLE, {
        asset_id: "INT AUTO_INCREMENT PRIMARY KEY",
        name: "CHAR(50) NOT NULL",
        added_date: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        addded_by: "CHAR(50) DEFAULT 'Admin'"
    }))
    .catch((err) => Promise.reject(new DbOperationError(`Error initializing database:\n\n${err.stack}`)));
    /*.then(() => _createTable(dbConnection, ASSET_LOCATION_TABLE, {
        asset_id: `INT NOT NULL PRIMARY KEY FOREIGN KEY REFERENCES ${ASSET_TABLE}(asset_id)`,
        site_id: `INT NOT NULL FOREIGN KEY REFERENCES ${SITES_TABLE}(site_id)`,
        location_id: `INT NOT NULL FOREIGN KEY REFERENCES ${LOCATIONS_TABLE}(location_id)`,
        last_edit: "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
    }))*/
};



// Creates a database, provided a connection object and a name
function _createDatabase(dbConnection, dbName)
{
    // Check that the given dbName is indeed a string
    if (typeof dbName !== "string")
        throw new TypeError(`Expected string, got '${dbName}' instead.`);

    // Construct query string and pass it to the connection object to query the database
    return dbConnection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    .catch((err) => Promise.reject(new DbOperationError(`Creating database with name ${dbName} failed\n\n:${err.stack}`)));
}

// Select the name of the database to use (need to do so before querying any table commands)
function _useDatabase(dbConnection, dbName)
{
    // Check that the given dbName is indeed a string
    if (typeof dbName !== "string")
        throw new TypeError(`Expected string, got '${dbName}' instead.`);

    // Construct query string and pass it to the connection object to query the database
    return dbConnection.query(`USE ${dbName}`)
    .catch((err) => Promise.reject(new DbOperationError(`Selecting database to use with name ${dbName} failed\n\n:${err.stack}`)));
}

function _createTable(dbConnection, tableName, tableSchema)
{
    var schemaStr = "";

    for (var colKey in tableSchema)
    {
        var colValueType = tableSchema[colKey];

        if (schemaStr !== "")
            schemaStr += ",";

        schemaStr += `${colKey} ${colValueType}`;
    }

    return dbConnection.query(`CREATE TABLE IF NOT EXISTS ${tableName} (${schemaStr})`);
}