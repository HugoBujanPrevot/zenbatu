
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

// Required modules
const sqlString = require("sqlstring");
const logger = require("../logger/logger");
const dbSchema = require("../data/db_schema.json");
const dbConnection = require("./database_connection");
const dbInitializer = require("./database_initializer");
const { DbOperationError } = require("../errors/custom_errors");

// Use the DB Connection module to create a connection, connect,
// and then use the DB Initializer module to initialize our tables
module.exports.connect = (hostIp, username, password) => {
    dbConnection.createConnection(hostIp, username, password);
    logger.log(`Created database connection object @ ${hostIp}`);

    return dbConnection.connect()
        .then(() => {
            logger.log(`Connected to database successfully`);
            return dbInitializer.initializeDb(dbConnection);
        })
        .then(() => logger.log(`Database initialized with dummy data`));
};

// Get the connection state through the DB Connection module
module.exports.getConnectionState = () => {
    return dbConnection.getState();
};

// Add a user account to the Accounts table
module.exports.addAccount = (username, password) => {
    return dbConnection.query(`INSERT INTO ${dbSchema.ACCOUNTS_TABLE} (username, password) VALUES (${sqlString.escape(username)}, ${sqlString.escape(password)});`)
        .then((result) => {
            logger.log(`Account with username '${username}' added to the database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to add account\n\n:${err.stack}`)));
};


// Add an asset to the database, with all the required fields
module.exports.addAsset = (assetObj) => {
    return exports.addAssets([assetObj]);
};

// Add an array of assets to the database, with all the required fields
module.exports.addAssets = (arrOfAssetObjects) => {
    var queryStr = "";

    // The query must be built in a single string of statements to ensure
    // that it happens as a single operation, thus either adding it all
    // or not adding any of it, to prevent errors
    arrOfAssetObjects.forEach((assetObj, i) => {
        queryStr += `\nINSERT INTO ${dbSchema.ASSET_TABLE} (asset_id, asset_name, username) VALUES (${sqlString.escape(assetObj.asset_id)}, ${sqlString.escape(assetObj.asset_name)}, ${sqlString.escape(assetObj.username)});\n` +
            `INSERT INTO ${dbSchema.ASSET_LOCATION_TABLE} (asset_id, site_id, location_id) VALUES (${sqlString.escape(assetObj.asset_id)}, ${sqlString.escape(assetObj.site_id)}, ${sqlString.escape(assetObj.location_id)});\n` +
            `INSERT INTO ${dbSchema.ASSET_TYPE_TABLE} (asset_id, brand, model, serial_no, category_id) VALUES (${sqlString.escape(assetObj.asset_id)}, ${sqlString.escape(assetObj.brand)}, ${sqlString.escape(assetObj.model)}, ${sqlString.escape(assetObj.serial_no)}, ${sqlString.escape(assetObj.category_id)});\n` +
            `INSERT INTO ${dbSchema.ASSET_PURCHASE_TABLE} (asset_id, purchase_date, cost, vendor, useful_life) VALUES (${sqlString.escape(assetObj.asset_id)}, ${sqlString.escape(assetObj.purchase_date)}, ${sqlString.escape(assetObj.cost)}, ${sqlString.escape(assetObj.vendor)}, ${sqlString.escape(assetObj.useful_life)});\n` +
            `INSERT INTO ${dbSchema.ASSET_MAINTENANCE_TABLE} (asset_id, maintenance_schedule) VALUES (${sqlString.escape(assetObj.asset_id)}, ${sqlString.escape(assetObj.maintenance_schedule)});\n`
    });

    // Make the query with the DB Connection module
    return dbConnection.query(queryStr)
        .then((result) => {
            logger.log(`Assets added to the database:`, arrOfAssetObjects);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to add assets\n\n:${err.stack}`)));
};

// Add asset categories to the database
module.exports.addCategories = (arrOfCategoryObjects) => {
    var queryStr = `INSERT INTO ${dbSchema.CATEGORIES_TABLE} (category_name, username) VALUES `;

    // The query must be built in a single string of statements to ensure
    // that it happens as a single operation, thus either adding it all
    // or not adding any of it, to prevent errors
    arrOfCategoryObjects.forEach((categoryObj, i) => {
        if (i > 0) queryStr += ",";
        queryStr += `(${sqlString.escape(categoryObj.category_name)}, ${sqlString.escape(categoryObj.username)})`;
    });

    // Make the query with the DB Connection module
    return dbConnection.query(queryStr)
        .then((result) => {
            logger.log(`Categories added to the database:`, arrOfCategoryObjects);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to add categories\n\n:${err.stack}`)));
};

// Add some new sites with some (or no) locations
module.exports.addSites = (arrOfSiteObjects) => {
    var queryStr = "";

    // The query must be built in a single string of statements to ensure
    // that it happens as a single operation, thus either adding it all
    // or not adding any of it, to prevent errors
    arrOfSiteObjects.forEach((siteObj) => {
        queryStr += `INSERT INTO ${dbSchema.SITES_TABLE} (site_name, username) VALUES (${sqlString.escape(siteObj.site_name)}, ${sqlString.escape(siteObj.username)});\n` +
            `SET @site_id = LAST_INSERT_ID();\n`;   // Set the id that will be created for the site above to reuse it in the query below

        // For each site, go through the different locations that will be added and insert them as well,
        // using the id of the previously stored site
        siteObj.locations.forEach((locationName, i) => {
            if (i === 0) queryStr += `INSERT INTO ${dbSchema.LOCATIONS_TABLE} (site_id, location_name) VALUES `;
            if (i > 0) queryStr += `,`;

            queryStr += `\n(@site_id, ${sqlString.escape(locationName)})`;
        });

        queryStr += ";\n"
    });

    // Make the query with the DB Connection module
    return dbConnection.query(queryStr)
        .then((result) => {
            logger.log(`Sites added to the database:`, arrOfSiteObjects);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to add sites\n\n:${err.stack}`)));
};

// Add a location to an existing site
module.exports.addLocation = (siteId, locationName) => {
    return dbConnection.query(`INSERT INTO ${dbSchema.LOCATIONS_TABLE} (site_id, location_name) VALUES (${sqlString.escape(siteId)}, ${sqlString.escape(locationName)});`)
        .then((result) => {
            logger.log(`Location added to the database:`, locationName);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to add asset\n\n:${err.stack}`)));
};

// Fetch the list of tables of the used database
module.exports.showTables = () => {
    return dbConnection.query(`SHOW TABLES;`)
        .then((result) => {
            logger.log(`Showing database tables:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to show tables\n\n:${err.stack}`)));
};

// Show the schema of a given table
module.exports.showTableSchema = (tableName) => {
    return dbConnection.query(`DESCRIBE ${tableName};`)
        .then((result) => {
            logger.log(`Describing database table ${tableName}:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to describe ${tableName}\n\n:${err.stack}`)));
};

// Delete a user's account from the table
module.exports.deleteAccount = (username) => {
    return dbConnection.query(`DELETE FROM ${dbSchema.ACCOUNTS_TABLE} WHERE account = ${username}`)
        .then((result) => {
            logger.log(`Account with username ${username} deleted from database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to delete account with username ${username}\n\n:${err.stack}`)));
};

module.exports.deleteAsset = (assetId, username) => {
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE} WHERE asset_id = ${sqlString.escape(assetId)} AND username = ${sqlString.escape(username)}`)
        .then((result) => {
            logger.log(`Asset with id ${assetId} deleted from database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to delete asset with id ${assetId}\n\n:${err.stack}`)));
};

module.exports.deleteAssets = (assetIds, username) => {
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE} WHERE asset_id IN ('${assetIds.join("','")}') AND username = ${sqlString.escape(username)}`)
        .then((result) => {
            logger.log(`Assets deleted from database:`, assetIds);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to delete assets with ids ${assetIds}\n\n:${err.stack}`)));
};

module.exports.deleteAllAssets = (username) => {
    // All sub-tables (AssetLocation, AssetPurchase, etc.) where asset_id is a foreign key should be
    // defined with the ON DELETE CASCADE constraint, so that when an asset is deleted on the Assets
    // table, all the rows on the sub-tables belonging to the same asset will also be deleted
    return dbConnection.query(`DELETE FROM ${dbSchema.ASSET_TABLE} WHERE username = ${sqlString.escape(username)}`)
        .then((result) => {
            logger.log(`Deleted *all* assets from database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to delete all assets\n\n:${err.stack}`)));
};

// Fetch the username and password hash of an account
module.exports.getAccount = (username) => {
    return dbConnection.query(`SELECT * FROM ${dbSchema.ACCOUNTS_TABLE} WHERE username = ${sqlString.escape(username)};`)
        .then((result) => {
            logger.log(`Fetched account with username ${username} from database`);
            return Promise.resolve(result[0]);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get account\n\n:${err.stack}`)));
};

// Fetch a category's data
module.exports.getCategory = (category_name, username) => {
    return dbConnection.query(`SELECT * FROM ${dbSchema.CATEGORIES_TABLE} WHERE category_name = ${sqlString.escape(category_name)} AND username = ${sqlString.escape(username)};`)
        .then((result) => {
            logger.log(`Fetched category with name ${category_name} from database`);
            return Promise.resolve(result[0]);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get category with name ${category_name}\n\n:${err.stack}`)));
};

// Fetch the data of all categories stored for a given username
module.exports.getAllCategories = (username) => {
    return dbConnection.query(`SELECT * FROM ${dbSchema.CATEGORIES_TABLE} WHERE username = ${sqlString.escape(username)};`)
        .then((result) => {
            logger.log(`Fetched all categories from database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get all categories\n\n:${err.stack}`)));
};

// Fetch a site's data by id or name, including all the locations that are assigned
// to that site's id in the Locations table by using INNER JOIN statements
module.exports.getSite = (siteNameOrId, username) => {
    return dbConnection.query(
        `SELECT * FROM ${dbSchema.SITES_TABLE}\n` +
        `INNER JOIN ${dbSchema.LOCATIONS_TABLE} ON ${dbSchema.SITES_TABLE}.site_id = ${dbSchema.LOCATIONS_TABLE}.site_id\n` +
        `WHERE (${dbSchema.SITES_TABLE}.site_name = ${sqlString.escape(siteNameOrId)} OR ${dbSchema.SITES_TABLE}.site_id = ${sqlString.escape(siteNameOrId)}) AND ${dbSchema.SITES_TABLE}.username = ${sqlString.escape(username)}`
    )
        .then((result) => {
            logger.log(`Fetched site with identifier ${siteNameOrId} from database`);
            return Promise.resolve(result[0]);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get site with identifier ${siteNameOrId}\n\n:${err.stack}`)));
};

// Get all sites that a given user has stored in the database, including the
// related locations assigned to each of those sites
module.exports.getAllSites = (username) => {
    return dbConnection.query(
        `SELECT * FROM ${dbSchema.SITES_TABLE}\n` +
        `INNER JOIN ${dbSchema.LOCATIONS_TABLE} ON ${dbSchema.SITES_TABLE}.site_id = ${dbSchema.LOCATIONS_TABLE}.site_id\n` +
        `WHERE ${dbSchema.SITES_TABLE}.username = ${sqlString.escape(username)};`
    )
        .then((result) => {
            logger.log(`Fetched all sites from database`);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get all sites\n\n:${err.stack}`)));
};

// Get an asset from the database, including all the data about it, like the
// purchase data, the maintenance data, etc. using INNER JOIN statements
module.exports.getAsset = (assetNameOrId, username) => {
    // Select an asset from the Assets table (check database diagram) and return the result
    const queryStr = `SELECT * FROM ${dbSchema.ASSET_TABLE}\n` +
    `INNER JOIN ${dbSchema.ASSET_LOCATION_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_LOCATION_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.SITES_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.site_id = ${dbSchema.SITES_TABLE}.site_id\n` +
    `INNER JOIN ${dbSchema.LOCATIONS_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.location_id = ${dbSchema.LOCATIONS_TABLE}.location_id\n` +
    `INNER JOIN ${dbSchema.ASSET_TYPE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_TYPE_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.CATEGORIES_TABLE} ON ${dbSchema.ASSET_TYPE_TABLE}.category_id = ${dbSchema.CATEGORIES_TABLE}.category_id\n` +
    `INNER JOIN ${dbSchema.ASSET_PURCHASE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_PURCHASE_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.ASSET_MAINTENANCE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_MAINTENANCE_TABLE}.asset_id\n` +
    `WHERE (${dbSchema.ASSET_TABLE}.asset_name = ${sqlString.escape(assetNameOrId)} OR ${dbSchema.ASSET_TABLE}.asset_id = ${sqlString.escape(assetNameOrId)}) AND ${dbSchema.ASSET_TABLE}.username = ${sqlString.escape(username)};`;

    return dbConnection.query(queryStr)
        .then((result) => {
            logger.log(`Fetched asset with identifier ${assetNameOrId} from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to select the asset\n\n:${err.stack}`)));
};

// Get all asset names for a user in the database and return them
module.exports.getAllAssetNames = (username) => {
    // Select All from the Assets table (check database diagram) and return the result
    return dbConnection.query(`SELECT * FROM ${dbSchema.ASSET_TABLE} WHERE username = ${sqlString.escape(username)}`)
        .then((result) => {
            logger.log(`Fetched all asset names from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to select all asset names\n\n:${err.stack}`)));
};

// Get all assets in the database, along with all the data from all the asset tables, and return them
// for a given username. Use INNER JOINS to fetch the related data from the tables peripheral to the Assets
module.exports.getFullAssets = (username) => {
    // Select All from the Assets table (check database diagram) and join it using the asset id with each of the tables
    const queryStr = `SELECT * FROM ${dbSchema.ASSET_TABLE}\n` +
    `INNER JOIN ${dbSchema.ASSET_LOCATION_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_LOCATION_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.SITES_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.site_id = ${dbSchema.SITES_TABLE}.site_id\n` +
    `INNER JOIN ${dbSchema.LOCATIONS_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.location_id = ${dbSchema.LOCATIONS_TABLE}.location_id\n` +
    `INNER JOIN ${dbSchema.ASSET_TYPE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_TYPE_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.CATEGORIES_TABLE} ON ${dbSchema.ASSET_TYPE_TABLE}.category_id = ${dbSchema.CATEGORIES_TABLE}.category_id\n` +
    `INNER JOIN ${dbSchema.ASSET_PURCHASE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_PURCHASE_TABLE}.asset_id\n` +
    `INNER JOIN ${dbSchema.ASSET_MAINTENANCE_TABLE} ON ${dbSchema.ASSET_TABLE}.asset_id = ${dbSchema.ASSET_MAINTENANCE_TABLE}.asset_id\n` +
    `WHERE ${dbSchema.ASSET_TABLE}.username = ${sqlString.escape(username)};`;

    return dbConnection.query(queryStr)
        .then((result) => {
            logger.log(`Fetched full asset data from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to select full assets\n\n:${err.stack}`)));
};

// Get the location data of a given asset
module.exports.getAssetLocation = (assetId) => {
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got ${sqlString.escape(assetId)} instead.`);

    // Select the asset with given id from the AssetLocation table and return it
    return dbConnection.query(
        `SELECT * FROM ${dbSchema.ASSET_LOCATION_TABLE} WHERE asset_id=${assetId}\n` +
        `INNER JOIN ${dbSchema.SITES_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.site_id = ${dbSchema.SITES_TABLE}.site_id\n` +
        `INNER JOIN ${dbSchema.LOCATIONS_TABLE} ON ${dbSchema.ASSET_LOCATION_TABLE}.location_id = ${dbSchema.LOCATIONS_TABLE}.location_id;`
    )
        .then((result) => {
            logger.log(`Fetched location data of asset ${assetId} from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's location data\n\n:${err.stack}`)));
};

// Get the type data of a given asset
module.exports.getAssetType = (assetId) => {
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetType table and return it
    return dbConnection.query(
        `SELECT * FROM ${dbSchema.ASSET_TYPE_TABLE} WHERE asset_id=${assetId}\n` +
        `INNER JOIN ${dbSchema.CATEGORIES_TABLE} ON ${dbSchema.ASSET_TYPE_TABLE}.category_id = ${dbSchema.CATEGORIES_TABLE}.category_id;`
    )
        .then((result) => {
            logger.log(`Fetched type data of asset ${assetId} from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's type data\n\n:${err.stack}`)));
};

// Get the purchase data of a given asset
module.exports.getAssetPurchase = (assetId) => {
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetPurchase table and return it
    return dbConnection.query(`SELECT * FROM ${dbSchema.ASSET_PURCHASE_TABLE} WHERE asset_id=${assetId}`)
        .then((result) => {
            logger.log(`Fetched purchase data of asset ${assetId} from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's purchase data\n\n:${err.stack}`)));
};

// Get the maintenance data of a given asset
module.exports.getAssetMaintenance = (assetId) => {
    // Check that the given assetId (the asset's database id, to be clear) is indeed an integer
    if (Number.isInteger(assetId) === false)
        throw new TypeError(`Expected integer asset id, got '${assetId}' instead.`);

    // Select the asset with given id from the AssetMaintenance table and return it
    return dbConnection.query(`SELECT * FROM ${dbSchema.ASSET_MAINTENANCE_TABLE} WHERE asset_id=${assetId}`)
        .then((result) => {
            logger.log(`Fetched maintenance data of asset ${assetId} from database:`, result);
            return Promise.resolve(result);
        })
        .catch((err) => Promise.reject(new DbOperationError(`Failed to get asset's maintenance data\n\n:${err.stack}`)));
};