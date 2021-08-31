const logger = require("../logger/logger");
const reporter = require("../report_manager/reporter");
const assetManager = require("../asset_manager/asset_manager");
const accountManager = require("../account_manager/account_manager");
const dbOperations = require("../database_integration/database_operations");


// Initialize all our end-points here
module.exports.initRoutes = function (expressApp) {
    // Index end-point; i.e. this is what sends our home page to user when they
    // connect to the right address on the browser (in dev phase, localhost:8089)
    expressApp.get("/", (request, response) => {
        response.render("index.ejs");
    });

    expressApp.get("/database", (request, response) => {
        response.render("database.ejs");
    });

    expressApp.post("/connect", (request, response) => {
        const params = request.body;
        const data = {};

        Promise.resolve(dbOperations.createConnection(params.ip))
               .then(() => dbOperations.connect())
               .then(() => accountManager.logIn(params.username, params.password))
               .then(() => {
                   logger.log("Fetching assets...");
                   return assetManager.getFullAssets();
               })
               .then((assets) => {
                   data.assets = assets;
                   return dbOperations.getAllCategories();
               })
               .then((categories) => {
                   data.categories = categories;
                   return dbOperations.getAllSites();
               })
               .then((sites) => {
                   data.sites = sites;
                   console.log("Full front end data");
                   console.log(data);
                   return response.render("user_home_page.ejs", data);
               })
               .catch((err) => response.render("index.ejs", {error: err.message}));
    });

    expressApp.post("/create_user", (request, response) => {
        var params = request.body;

        Promise.resolve(dbOperations.createConnection(params.ip))
               .then(() => dbOperations.connect())
               .then(() => accountManager.signUp(params.username, params.password))
               .then(() => response.render("index.ejs", {success: true}))
               .catch((err) => response.render("index.ejs", {error: err.message}));
    });

    expressApp.get("/add_asset_page", (request, response) => {
        response.render("add_asset_page.ejs");
    });

    expressApp.get("/get_asset_page", (request, response) => {
        response.render("get_asset_page.ejs");
    });

    expressApp.get("/get_asset", (request, response) => {
        logger.log(`User requested the following asset:\n\n`, request.query);

        return assetManager.getAsset({
            name: request.query.name,
            id: request.query.id
        });
    });

    expressApp.post("/add_asset", (request, response) => {
        var assetData = request.body;

        logger.log(`User sent the following asset data:\n\n`, assetData);
        return assetManager.addAsset(assetData.name);
    });
}