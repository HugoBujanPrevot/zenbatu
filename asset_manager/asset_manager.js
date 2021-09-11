const logger = require("../logger/logger");
const idGenerator = require("./id_generator");
const dbOperations = require("../database_integration/database_operations");


module.exports.addAsset = (assetData) => {
    return exports.addAssets([ assetData ]);
};

module.exports.addAssets = (assets) => {

    if (Array.isArray(assets) === false)
        return Promise.reject(new TypeError(`Expected array of assets, got ${typeof assets} instead.`));

    assets.map((assetData) => Object.assign(assetData, {asset_id: idGenerator.generateId()}));

    return dbOperations.addAssets(assets)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when adding assets to the database.`));
        });
};

module.exports.getAsset = ({name, id, username}) => {
    return dbOperations.getAsset((id != null) ? id : name, username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the asset from the database.`));
        });
};

module.exports.getFullAssets = (username) => {
    return dbOperations.getFullAssets(username)
        .catch((err) => {
            logger.log(`Error: ${err.message}`, err.stack);
            return Promise.reject(new Error(`Error occurred when getting the full assets from the database.`));
        });
};

module.exports.addCategories = (arrOfCategoryObjects) => {
    if (Array.isArray(arrOfCategoryObjects) === false)
        throw new TypeError(`Expected array of categories, got ${typeof arrOfCategoryObjects} instead.`);

    if (arrOfCategoryObjects.length <= 0)
        throw new Error(`Array of categories is empty.`);

    return dbOperations.addCategories(arrOfCategoryObjects);
};

module.exports.addSites = (arrOfSiteObjects) => {
    if (Array.isArray(arrOfSiteObjects) === false)
        throw new TypeError(`Expected array of categories, got ${typeof arrOfSiteObjects} instead.`);

    if (arrOfSiteObjects.length <= 0)
        throw new Error(`Array of categories is empty.`);

    return dbOperations.addSites(arrOfSiteObjects);
};

// Add a location to an existing site
module.exports.addLocation = (locationData) => {
    if (locationData.site_id == null)
        throw new Error(`Location data needs to contain a site_id.`);

    if (locationData.location_name == null)
        throw new Error(`Location data needs to contain a location_name.`);

    return dbOperations.addLocation(locationData.site_id, locationData.location_name);
};