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

    expressApp.get("/connectionState", (request, response) => {
        response.send(dbOperations.getConnectionState());
    });

    expressApp.post("/loggedIn", (request, response) => {
        const params = request.body;
        const isLoggedIn = accountManager.isSessionActive(params.sessionId);
        response.send({ success: true, data: isLoggedIn });
    });

    expressApp.post("/logOut", (request, response) => {
        const params = request.body;

        Promise.resolve(accountManager.logOut(params.sessionId))
            .then(() => response.redirect("/"))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/login", (request, response) => {
        const params = request.body;
        const data = {};

        accountManager.logIn(params.username, params.password)
            .then((id) => {
                data.sessionId = id;
                logger.log(`Fetching assets for session Id ${params.username}...`);
                return assetManager.getFullAssets(params.username);
            })
            .then((assets) => {
                data.assets = assets;
                return dbOperations.getAllCategories(params.username);
            })
            .then((categories) => {
                data.categories = categories;
                return dbOperations.getAllSites(params.username);
            })
            .then((sites) => {
                data.sites = sites;
                return response.render("user_dashboard.ejs", data);
            })
            .catch((err) =>
            {
                logger.log(`Error occurred:`, err);
                response.render("user_dashboard.ejs", { success: false, err: err.message });
            });
    });

    expressApp.post("/create_user", (request, response) => {
        const params = request.body;

        Promise.resolve(dbOperations.createConnection(params.ip))
            .then(() => dbOperations.connect())
            .then(() => accountManager.signUp(params.username, params.password))
            .then(() => response.send({success: true }))
            .catch((err) => response.send({ success: false, err: err.message } ));
    });

    expressApp.get("/add_asset_page", (request, response) => {
        response.render("add_asset_page.ejs");
    });

    expressApp.get("/get_asset_page", (request, response) => {
        response.render("get_asset_page.ejs");
    });

    expressApp.post("/get_asset", (request, response) => {
        logger.log(`User requested the following asset:\n\n`, request.body);
        const params = request.body;
        const username = accountManager.getUsername(params.sessionId);

        if (username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        return assetManager.getAsset({
            name: params.name,
            id: params.id,
            username
        })
            .then((result) => response.send({ success: true, data: result }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_asset", (request, response) => {
        const assetData = request.body;
        assetData.username = accountManager.getUsername(params.sessionId);

        if (assetData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following asset data:\n\n`, assetData);
        return assetManager.addAsset(assetData)
            .then((result) => response.send({ success: true }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_category", (request, response) => {
        const categoryData = request.body;
        categoryData.username = accountManager.getUsername(params.sessionId);

        if (categoryData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following category data:\n\n`, categoryData);
        return assetManager.addCategories([ categoryData ])
            .then((result) => response.send({ success: true }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_site", (request, response) => {
        const siteData = request.body;
        siteData.username = accountManager.getUsername(params.sessionId);

        if (siteData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following site data:\n\n`, siteData);
        return assetManager.addSites([ siteData ])
            .then((result) => response.send({ success: true }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_location", (request, response) => {
        const locationData = request.body;
        locationData.username = accountManager.getUsername(params.sessionId);

        if (locationData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following site data:\n\n`, locationData);
        return assetManager.addLocation(locationData)
            .then((result) => response.send({ success: true }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/report", async (request, response) => {
        const params = request.body;
        const username = accountManager.getUsername(params.sessionId);

        if (username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        try {
            const report = reporter.generateReport(username);
            response.send({ success: true, data: report });

        } catch(err) {
            response.send({ success: false, err: err.message });
        }
    });
}