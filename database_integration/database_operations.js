

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


const dbSchema = require("../data/db_schema.json");
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


// Add an asset to the database, with all the required fields
module.exports.addAsset = (assetObj) =>
{
    return exports.addAssets([ assetObj ]);
};

// Add an array of assets to the database, with all the required fields
module.exports.addAssets = (arrOfAssetObjects) =>
{
    var queryStr = "";

    arrOfAssetObjects.forEach((assetObj, i) =>
    {
        queryStr += `\nINSERT INTO ${dbSchema.ASSET_TABLE} (name) VALUES ('${assetObj.name}');\n` +
        `SET @asset_id = LAST_INSERT_ID();\n` +
        `INSERT INTO ${dbSchema.ASSET_LOCATION_TABLE} (asset_id, site_id, location_id) VALUES (@asset_id, '${assetObj.site_id}', '${assetObj.location_id}');\n` +
        `INSERT INTO ${dbSchema.ASSET_TYPE_TABLE} (asset_id, brand, model, serial_no, category_id) VALUES (@asset_id, '${assetObj.brand}', '${assetObj.model}', '${assetObj.serial_no}', '${assetObj.category_id}');\n` +
        `INSERT INTO ${dbSchema.ASSET_PURCHASE_TABLE} (asset_id, purchase_date, cost, vendor) VALUES (@asset_id, '${assetObj.purchase_date}', '${assetObj.cost}', '${assetObj.vendor}');\n`
    });

    return dbConnection.query(queryStr)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to add assets\n\n:${err.stack}`)));
};

// Add asset categories to the database
module.exports.addCategories = (arrOfCategoryObjects) =>
{
    var queryStr = `INSERT INTO ${dbSchema.CATEGORIES_TABLE} (name) VALUES `;

    arrOfCategoryObjects.forEach((categoryObj, i) => 
    {
        if (i > 0) queryStr += ",";
        queryStr += `('${categoryObj.name}')`;
    });

    return dbConnection.query(queryStr)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to add categories\n\n:${err.stack}`)));
};

// Add some new sites with some (or no) locations
module.exports.addSites = (arrOfSiteObjects) =>
{
    var queryStr = "";

    arrOfSiteObjects.forEach((siteObj) => 
    {
        queryStr += `INSERT INTO ${dbSchema.SITES_TABLE} (name) VALUES ('${siteObj.name}');\n` + 
                    `SET @site_id = LAST_INSERT_ID();\n`;


        siteObj.locations.forEach((locationName, i) =>
        {
            if (i === 0)    queryStr += `INSERT INTO ${dbSchema.LOCATIONS_TABLE} (site_id, name) VALUES `;
            if (i > 0)      queryStr += `,`;
            
            queryStr += `\n(@site_id, '${locationName}')`;
        });

        queryStr += ";\n"
    });

    console.log(queryStr);
    return dbConnection.query(queryStr)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to add sites\n\n:${err.stack}`)));
};

// Add a location to an existing site
module.exports.addLocation = (siteId, locationName) =>
{
    return dbConnection.query(`INSERT INTO ${dbSchema.LOCATIONS_TABLE} (site_id, name) VALUES ('${siteId}', '${locationName}');`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to add asset\n\n:${err.stack}`)));
};

// Fetch the list of tables of the used database
module.exports.showTables = () =>
{
    return dbConnection.query(`SHOW TABLES;`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to show tables\n\n:${err.stack}`)));
};

module.exports.showTableSchema = (tableName) =>
{
    return dbConnection.query(`DESCRIBE ${tableName};`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to describe ${tableName}\n\n:${err.stack}`)));
};

module.exports.deleteAsset = (assetId) =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE} WHERE asset_id = ${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete asset with id ${assetId}\n\n:${err.stack}`)));
};

module.exports.deleteAssets = (assetIds) =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE} WHERE asset_id IN (${assetIds.join(",")})`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete assets with ids ${assetIds}\n\n:${err.stack}`)));
};

module.exports.deleteAllAssets = () =>
{
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to delete all assets\n\n:${err.stack}`)));
};

// Get all assets in the database and return them
module.exports.getAsset = (assetNameOrId) =>
{
    // Select an asset from the Assets table (check database diagram) and return the result
    return dbConnection.query(`SELECT * FROM ${dbSchema.ASSET_TABLE} WHERE name = '${assetNameOrId}' OR asset_id = '${assetNameOrId}'`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select the asset\n\n:${err.stack}`)));
};

// Get all assets in the database and return them
module.exports.getAllAssetNames = () =>
{
    // Select All from the Assets table (check database diagram) and return the result
    return dbConnection.query(`SELECT * FROM ${dbSchema.ASSET_TABLE}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select all assets\n\n:${err.stack}`)));
};

// Get all assets in the database, along with all the data from all the asset tables, and return them
module.exports.getFullAssets = () =>
{
    // Select All from the Assets table (check database diagram) and join it using the asset id with each of the tables
    return dbConnection.query(
        `SELECT * FROM ${dbSchema.ASSET_TABLE}` +
        `INNER JOIN ${dbSchema.ASSET_LOCATION_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_LOCATION_TABLE}.asset_id` +
        `INNER JOIN ${dbSchema.ASSET_PURCHASE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_PURCHASE_TABLE}.asset_id` +
        `INNER JOIN ${dbSchema.ASSET_MAINTENANCE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_MAINTENANCE_TABLE}.asset_id;`
    )
    .catch((err) => Promise.reject(new DbOperationError(`Failed to select all assets\n\n:${err.stack}`)));
};

// Get the location data of a given asset
module.exports.getAssetLocation = (assetId) =>
{
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetType table and return it
    return dbConnection.query(`SELECT FROM ${dbSchema.ASSET_TYPE_TABLE} WHERE asset_id=${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's location\n\n:${err.stack}`)));
};

// Get the purchase data of a given asset
module.exports.getAssetPurchase = (assetId) =>
{
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetPurchase table and return it
    return dbConnection.query(`SELECT FROM ${dbSchema.ASSET_PURCHASE_TABLE} WHERE asset_id=${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's location\n\n:${err.stack}`)));
};

// Get the maintenance data of a given asset
module.exports.getAssetMaintenance = (assetId) =>
{
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetMaintenance table and return it
    return dbConnection.query(`SELECT FROM ${dbSchema.ASSET_MAINTENANCE_TABLE} WHERE asset_id=${assetId}`)
    .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's location\n\n:${err.stack}`)));
};