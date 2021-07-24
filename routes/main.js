
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
        .then(() => response.render("index.ejs", { connected: true }))
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
        console.log(`User asked for the following asset:\n\n`, request.query);
        
        return assetManager.getAsset({
            name: request.query.name,
            id: request.query.id
        })
        .then((assetInfo) => console.log(assetInfo));
    });

    expressApp.post("/add_asset", (request, response) =>
    {
        console.log(`User sent the following data:\n\n`, request.body);
        return assetManager.addAsset(request.body.name)
        .then((assetInfo) => console.log(assetInfo));
    });
}