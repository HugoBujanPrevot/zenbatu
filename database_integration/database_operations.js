

/**
 * This module contains all the necessary database queries encapsulated into 
 * their own functions for convenience. Queries are made in SQL (all the different 
 * query commands can be found here https://dev.mysql.com/doc/refman/8.0/en/sql-statements.html).
 * They use the query() function found in the database_connection module to pass
 * one of said SQL statements directly to the database, and get the result back.
 * It's all done through Promises (https://www.w3schools.com/js/js_promise.asp) since
 * a database query is an asynchronous operation, and Promises make it cleaner than
 * using regular callbacks.
 */


const dbConnection = require("./database_connection");
const dbInitializer = require("./database_initializer");
const DbOperationError = require("../errors/db_operation_error");


module.exports.createConnection = (hostIp, username, password) =>
{
    dbConnection.createConnection(hostIp, username, password);
};

module.exports.connect = () =>
{
    return dbConnection.connect()
    .then(() => dbInitializer.initializeDb(dbConnection))
};


// Get all assets in the database and return them
module.exports.addAsset = (assetName) =>
{
    // Select All from the Assets table (check database diagram) and return the result
    return dbConnection.query(`INSERT INTO Assets (asset_name) VALUES (${assetName})`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select all assets\n\n:${err.stack}`)));
};

module.exports.deleteAsset = (assetId) =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM Assets WHERE asset_id = ${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete asset with id ${assetId}\n\n:${err.stack}`)));
};

module.exports.deleteAssets = (assetIds) =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM Assets WHERE asset_id IN (${assetIds.join(",")})`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete assets with ids ${assetIds}\n\n:${err.stack}`)));
};

module.exports.deleteAllAssets = () =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM Assets`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete all assets\n\n:${err.stack}`)));
};

// Get all assets in the database and return them
module.exports.getAsset = (assetNameOrId) =>
{
    // Select an asset from the Assets table (check database diagram) and return the result
    return dbConnection.query(`SELECT * FROM Assets WHERE name = '${assetNameOrId}' OR asset_id = '${assetNameOrId}'`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select the asset\n\n:${err.stack}`)));
};

// Get all assets in the database and return them
module.exports.getAssets = () =>
{
    // Select All from the Assets table (check database diagram) and return the result
    return dbConnection.query(`SELECT * FROM Assets`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select all assets\n\n:${err.stack}`)));
};

// Get all assets in the database and return them
module.exports.getAssetLocation = (assetId) =>
{
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetLocation table and return it
    return dbConnection.query(`SELECT FROM AssetLocation WHERE asset_id=${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select all assets\n\n:${err.stack}`)));
};