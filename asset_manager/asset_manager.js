
/**
 * The Asset Manager module contains all of the methods necessary to
 * interact with the Database Operations module and manage assets:
 * add new ones, add new related information (categories, locations),
 * fetch them from the database, etc.
 */

// Required modules
const logger = require("../logger/logger");
const idGenerator = require("./id_generator");
const dbOperations = require("../database_integration/database_operations");

// Add a single asset to the database and then query the database
// for that very same asset, to return the full information of it
// to the front-end, including it's automatically assigned id
module.exports.addAsset = (assetData) => {
    return exports.addAssets([ assetData ])
    .then((result) => exports.getAsset({ 
        id: null,
        name: assetData.asset_name, 
        username: assetData.username
    }));
};

// Add an array of assets to the database in a single query. Assign
// each of them their own unique id with the uuid generator module
module.exports.addAssets = (assets) => {

    // Check that the data is correct
    if (Array.isArray(assets) === false)
        return Promise.reject(new TypeError(`Expected array of assets, got ${typeof assets} instead.`));

    // Iterate through the data to add a uuid to each of the assets
    assets.map((assetData) => Object.assign(assetData, {asset_id: idGenerator.generateId()}));

    // Let the DB Operations module handle the actual adding to the database
    return dbOperations.addAssets(assets)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when adding assets to the database.`));
        });
};

// Add a category to the database and then fetch the record
// of that same category, to be able to return the data to
// the front-end, including the auto-added id
module.exports.addCategory = (categoryData) => {
    return dbOperations.addCategories([ categoryData ])
    .then((result) => exports.getCategory({
        id: categoryData.category_id,
        name: categoryData.category_name, 
        username: categoryData.username
    }));
};

// Add multiple categories in a single query
module.exports.addCategories = (arrOfCategoryObjects) => {
    // Check that our data is correct
    if (Array.isArray(arrOfCategoryObjects) === false)
        throw new TypeError(`Expected array of categories, got ${typeof arrOfCategoryObjects} instead.`);

    // Check that the data is not empty
    if (arrOfCategoryObjects.length <= 0)
        throw new Error(`Array of categories is empty.`);

    // Let the DB Operations module add the categories
    return dbOperations.addCategories(arrOfCategoryObjects);
};

// Add a site to the database and then fetch the record
// of that same site, to be able to return the data to
// the front-end, including the auto-added id 
module.exports.addSite = (siteData) => {
    return dbOperations.addSites([ siteData ])
    .then((result) => exports.getSite({ 
        id: null,
        name: siteData.site_name, 
        username: siteData.username
    }));
};

// Add multiple sites in a single query
module.exports.addSites = (arrOfSiteObjects) => {
    // Check that our data is correct
    if (Array.isArray(arrOfSiteObjects) === false)
        throw new TypeError(`Expected array of categories, got ${typeof arrOfSiteObjects} instead.`);

    // Check that the data is not empty
    if (arrOfSiteObjects.length <= 0)
        throw new Error(`Array of categories is empty.`);

    // Let the DB Operations module add the categories
    return dbOperations.addSites(arrOfSiteObjects);
};

// Add a location to an existing site and then fetch the record
// of that same site, to be able to return the data to
// the front-end, including the auto-added id 
module.exports.addLocation = (locationData) => {
    // Check that our data has a site id
    if (locationData.site_id == null)
        throw new Error(`Location data needs to contain a site_id.`);

    // Check that our data has a location name
    if (locationData.location_name == null)
        throw new Error(`Location data needs to contain a location_name.`);

    // Let the DB Operations module do the adding and the fetching
    return dbOperations.addLocation(locationData.site_id, locationData.location_name)
        .then((result) => exports.getSite({ 
            id: locationData.site_id,
            name: null, 
            username: locationData.username
        }));
};

// Fetches the data of an asset either by name or by id,
// and use the username as a filter to ensure only that
// user's assets are checked
module.exports.getAsset = ({name, id, username}) => {
    return dbOperations.getAsset((id != null) ? id : name, username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the asset from the database.`));
        });
};

// Fetches the full data of all assets that a username
// has stored in the database. This is done when the user
// logs in, to display them all in the data table
module.exports.getFullAssets = (username) => {
    return dbOperations.getFullAssets(username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the full assets from the database.`));
        });
};

// Get a category's data by name or id, using the username
// as a filter to only check that user's categories
module.exports.getCategory = ({name, id, username}) => {
    return dbOperations.getCategory((id != null) ? id : name, username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the category from the database.`));
        });
};

// Get the data of all categories defined by a user
module.exports.getAllCategories = (username) => {
    return dbOperations.getAllCategories(username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting all categories from the database.`));
        });
};

// Get a site's data by name or id, using the username
// as a filter to only check that user's categories
module.exports.getSite = ({name, id, username}) => {
    return dbOperations.getSite((id != null) ? id : name, username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the site from the database.`));
        });
};

// Get the data of all sites defined by a user
module.exports.getAllSites = (username) => {
    return dbOperations.getAllSites(username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting all sites from the database.`));
        });
};
