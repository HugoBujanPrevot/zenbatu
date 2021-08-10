
const dbSchema = require("../data/db_schema.json");
const dbOperations = require("./database_operations");
const DbOperationError = require("../errors/db_operation_error");


module.exports.initializeDb = (dbConnection) =>
{
    return _deleteDatabase(dbConnection, dbSchema.DB_NAME)
    .then(() => _createDatabase(dbConnection, dbSchema.DB_NAME))
    .then(() => _useDatabase(dbConnection, dbSchema.DB_NAME))
    .then(() => _createTable(dbConnection, dbSchema.ASSET_TABLE, {
        asset_id: "INT AUTO_INCREMENT PRIMARY KEY",
        name: "CHAR(50) NOT NULL",
        added_date: "DATETIME DEFAULT CURRENT_TIMESTAMP",
        added_by: "CHAR(50) DEFAULT 'Admin'"
    }))
    .then((result) => 
    {
        console.log(`${dbSchema.ASSET_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.SITES_TABLE, {
            site_id: "INT AUTO_INCREMENT PRIMARY KEY",
            name: "CHAR(50) NOT NULL"
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.SITES_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.LOCATIONS_TABLE, {
            location_id: "INT AUTO_INCREMENT PRIMARY KEY",
            site_id: `INT NOT NULL`,
            name: "CHAR(50) NOT NULL",
            foreign_keys: [
                `FOREIGN KEY (site_id) REFERENCES ${dbSchema.SITES_TABLE}(site_id)`,
            ]
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.LOCATIONS_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.CATEGORIES_TABLE, {
            category_id: "INT AUTO_INCREMENT PRIMARY KEY",
            name: "CHAR(50) NOT NULL"
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.CATEGORIES_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.ASSET_LOCATION_TABLE, {
            asset_id: `INT NOT NULL PRIMARY KEY`,
            site_id: `INT NOT NULL`,
            location_id: `INT NOT NULL`,
            last_edit: "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
            foreign_keys: [
                `FOREIGN KEY (asset_id) REFERENCES ${dbSchema.ASSET_TABLE}(asset_id) ON DELETE CASCADE`,
                `FOREIGN KEY (site_id) REFERENCES ${dbSchema.SITES_TABLE}(site_id)`,
                `FOREIGN KEY (location_id) REFERENCES ${dbSchema.LOCATIONS_TABLE}(location_id)`
            ]
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.ASSET_LOCATION_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.ASSET_TYPE_TABLE, {
            asset_id: `INT NOT NULL PRIMARY KEY`,
            brand: "CHAR(50) NOT NULL",
            model: "CHAR(100) NOT NULL",
            serial_no: "CHAR(50) NOT NULL",
            category_id: `INT`,
            foreign_keys: [
                `FOREIGN KEY (asset_id) REFERENCES ${dbSchema.ASSET_TABLE}(asset_id) ON DELETE CASCADE`,
                `FOREIGN KEY (category_id) REFERENCES ${dbSchema.CATEGORIES_TABLE}(category_id)`
            ]
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.ASSET_TYPE_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.ASSET_PURCHASE_TABLE, {
            asset_id: `INT NOT NULL PRIMARY KEY`,
            purchase_date: "DATE NOT NULL",
            cost: "DECIMAL(12, 2) NOT NULL",
            vendor: "CHAR(50) NOT NULL",
            foreign_keys: [
                `FOREIGN KEY (asset_id) REFERENCES ${dbSchema.ASSET_TABLE}(asset_id) ON DELETE CASCADE`,
            ]
        })
    })
    .then((result) => 
    {
        console.log(`${dbSchema.ASSET_PURCHASE_TABLE} table created:\n\n`, result);
        return _createTable(dbConnection, dbSchema.ASSET_MAINTENANCE_TABLE, {
            asset_id: `INT NOT NULL PRIMARY KEY`,
            last_maintenance_date: "DATE",
            maintenance_schedule: "CHAR(100) NOT NULL",
            serial_no: "CHAR(50) NOT NULL",
            foreign_keys: [
                `FOREIGN KEY (asset_id) REFERENCES ${dbSchema.ASSET_TABLE}(asset_id) ON DELETE CASCADE`,
            ]
        });
    })
    .then((result) => 
    {
        console.log(`${dbSchema.ASSET_MAINTENANCE_TABLE} table created:\n\n`, result);
        return _insertDummyData();
    })
    .catch((err) => 
    {
        console.log(err);
        return Promise.reject(new DbOperationError(`Error initializing database:\n\n${err.stack}`))
    });
};


// Delete the database, so as to start clear each time for testing purposes
function _deleteDatabase(dbConnection, dbName)
{
    // Check that the given dbName is indeed a string
    if (typeof dbName !== "string")
        throw new TypeError(`Expected string, got '${dbName}' instead.`);

    // Construct query string and pass it to the connection object to query the database
    return dbConnection.query(`DROP DATABASE ${dbName}`)
    .catch((err) => Promise.reject(new DbOperationError(`Deleting database ${dbName} failed\n\n:${err.stack}`)));
}

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

// Take an object with keys that will act as the column keys, and values that will act as the
// data types and constraints for those keys. The 'foreign_keys' key in the object is expected
// to be an array, and will be added at the end to codify all the foreign keys in the table
function _createTable(dbConnection, tableName, tableSchema)
{
    var schemaStr = "";
    var foreignKeysStr = "";

    // Iterate through object to write the schema
    for (var colKey in tableSchema)
    {
        var colValueType = tableSchema[colKey];

        // If this isn't the first value we're adding, separate with a comma
        if (schemaStr !== "")
            schemaStr += ",\n";

        // If there is a foreign_keys key and value pair, it's expected to be an array;
        // iterate through it and add all foreign key constraints
        if (colKey === "foreign_keys")
        {
            colValueType.forEach((foreignKey, i) => 
            {
                if (i !== 0) foreignKeysStr += `,\n`;
                foreignKeysStr += `\t${foreignKey}`;
            });
        }

        // Otherwise just add the key as the column's key and its value as the data type
        else schemaStr += `\t${colKey} ${colValueType}`;
    }

    console.log(`CREATE TABLE IF NOT EXISTS ${tableName} (\n${schemaStr}${foreignKeysStr}\n);`);
    return dbConnection.query(`CREATE TABLE IF NOT EXISTS ${tableName} (\n${schemaStr}${foreignKeysStr}\n);`);
}

function _insertDummyData()
{
    const assets = require("../data/dummy_assets.json");
    const categories = require("../data/dummy_categories.json");
    const sites = require("../data/dummy_sites.json");

    return dbOperations.addSites(sites)
    .then((result) =>
    {
        console.log(`Added dummy sites\n\n`, result);
        return dbOperations.addCategories(categories);
    })
    .then((result) =>
    {
        console.log(`Added dummy categories\n\n`, result);
        return dbOperations.addAssets(assets);
    })
    .then((result) =>
    {
        console.log(`Added dummy assets\n\n`, result);
        return Promise.resolve();
    })
}