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

    expressApp.get("/account_page", (request, response) => {
        response.render("account_page.ejs");
    });

    expressApp.get("/connection_state", (request, response) => {
        response.send(dbOperations.getConnectionState());
    });

    expressApp.post("/logged_in", (request, response) => {
        const params = request.body;
        const isLoggedIn = accountManager.isSessionActive(params.sessionId);
        response.send({ success: true, data: isLoggedIn });
    });

    expressApp.post("/log_out", (request, response) => {
        const params = request.body;

        Promise.resolve(accountManager.logOut(params.sessionId))
            .then(() => response.redirect("/"))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/login", (request, response) => {
        const params = request.body;
        _logIn(params.username, params.password, response);
    });

    expressApp.post("/create_user", (request, response) => {
        const params = request.body;

        return accountManager.signUp(params.username, params.password)
            .then(() => _logIn(params.username, params.password, response))
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
        assetData.username = accountManager.getUsername(assetData.sessionId);

        if (assetData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following asset data:\n\n`, assetData);
        return assetManager.addAsset(assetData)
            .then((data) => response.send({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_category", (request, response) => {
        const categoryData = request.body;
        categoryData.username = accountManager.getUsername(categoryData.sessionId);

        if (categoryData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        logger.log(`User sent the following category data:\n\n`, categoryData);
        return assetManager.addCategory(categoryData)
            .then((data) => response.json({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_site", (request, response) => {
        const siteData = request.body;
        const siteObj = { 
            site_name: siteData.site_name, 
            locations: [ siteData.location_name ] 
        };

        logger.log(`User sent the following site data:\n\n`, siteData);

        siteObj.username = accountManager.getUsername(siteData.sessionId);

        if (siteObj.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        return assetManager.addSite(siteObj)
            .then((data) => response.send({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    expressApp.post("/add_location", (request, response) => {
        const locationData = request.body;
        logger.log(`User sent the following site data:\n\n`, locationData);
        locationData.username = accountManager.getUsername(locationData.sessionId);

        if (locationData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        return assetManager.addLocation(locationData)
            .then((data) => response.send({ success: true, data }))
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


async function _logIn(username, password, response)
{
    try {
        const sessionId = await accountManager.logIn(username, password);
        logger.log(`Fetching data for username ${username}...`);
        const data = await _getUserData(username);
        data.sessionId = sessionId;
        return response.render("user_dashboard.ejs", data);
    } catch(err) {
        logger.log(`Error occurred:`, err);
        response.render("user_dashboard.ejs", { success: false, err: err.message });
    }
}
async function _getUserData(username)
{
    const data = {};
    data.assets = await assetManager.getFullAssets(username);
    data.categories = await assetManager.getAllCategories(username);
    data.sites = await assetManager.getAllSites(username);
    return data;
}