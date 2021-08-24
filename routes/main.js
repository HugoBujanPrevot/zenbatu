
const logger = require("../logger/logger");
const reporter = require("../report_manager/reporter");
const assetManager = require("../asset_manager/asset_manager");
const dbOperations = require("../database_integration/database_operations");


// Initialize all our end-points here
module.exports.initRoutes = function (expressApp)
{
    // Index end-point; i.e. this is what sends our home page to user when they
    // connect to the right address on the browser (in dev phase, localhost:8089)
    expressApp.get("/", (request, response) =>
    {
        response.render("index.ejs");
    });

    expressApp.post("/connect", (request, response) =>
    {
        var params = request.body;

        // TODO: Do account checking on account manager
        Promise.resolve(dbOperations.createConnection(params.ip, params.user, params.password))
        .then(() => dbOperations.connect())
        .then(() => 
        {
            logger.log("Generating report");
            return reporter.generateReport();
        })
        .then((report) => response.render("index.ejs", { connected: true }))
        .catch((err) => response.render("index.ejs", { error: err.message }));
    });

    expressApp.get("/add_asset_page", (request, response) =>
    {
        response.render("add_asset_page.ejs");
    });

    expressApp.get("/get_asset_page", (request, response) =>
    {
        response.render("get_asset_page.ejs");
    });

    expressApp.get("/get_asset", (request, response) =>
    {
        logger.log(`User requested the following asset:\n\n`, request.query);
        
        return assetManager.getAsset({
            name: request.query.name,
            id: request.query.id
        });
    });

    expressApp.post("/add_asset", (request, response) =>
    {
        var assetData = request.body;

        logger.log(`User sent the following asset data:\n\n`, assetData);
        return assetManager.addAsset(assetData.name);
    });
}