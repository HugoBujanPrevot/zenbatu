
/**
 * This module is where all of the HTTP end-points are defined.
 * Most of the heavy lifting done in those end-points are deferred
 * to the other modules like the Asset or Account managers
 */

// The required modules
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

    // Render the account page for the user to log in or sign up
    expressApp.get("/account_page", (request, response) => {
        response.render("account_page.ejs");
    });

    // Get the current database connection state (if connected or not)
    expressApp.get("/connection_state", (request, response) => {
        response.send(dbOperations.getConnectionState());
    });

    // Check whether a given session Id is currently active. It's important
    // to do this through a generated session id rather than a username,
    // or anyone could create an HTTP request and obtain information on
    // whether certain usernames are logged in
    expressApp.post("/logged_in", (request, response) => {
        const params = request.body;
        const isLoggedIn = accountManager.isSessionActive(params.sessionId);
        response.send({ success: true, data: isLoggedIn });
    });

    // Log out of a session, thus deleting the currently stored session id
    expressApp.post("/log_out", (request, response) => {
        const params = request.body;

        Promise.resolve(accountManager.logOut(params.sessionId))
            .then(() => response.redirect("/"))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Log in. This will check the provided username and password through
    // the Account Manager, and then fetch all of a user's assets to display
    // them in their dashboard. See the function _logIn() defined at the bottom
    // of the page for all the nitty gritty details
    expressApp.post("/login", (request, response) => {
        const params = request.body;
        _logIn(params.username, params.password, response);
    });

    // Sign up a new username/password, and if successful, log it in as above
    expressApp.post("/create_user", (request, response) => {
        const params = request.body;

        // Let the Account Manager do the sign up process
        return accountManager.signUp(params.username, params.password)
            .then(() => _logIn(params.username, params.password, response))
    });

    // Fetch an asset's data. First check the credentials with the Account Manager
    // (whether the session id that the front-end provided is correct), then
    // return the asset information for that particular username based on the data received
    expressApp.post("/get_asset", (request, response) => {
        logger.log(`User requested the following asset:\n\n`, request.body);
        const params = request.body;
        const username = accountManager.getUsername(params.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        // Fetch the asset through the Asset Manager and return the data to the front-end
        return assetManager.getAsset({
            name: params.name,
            id: params.id,
            username
        })
            .then((result) => response.send({ success: true, data: result }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Add a new asset. First check the credentials with the Account Manager
    // (whether the session id that the front-end provided is correct), then
    // add the asset information for that particular username based on the data received
    expressApp.post("/add_asset", (request, response) => {
        const assetData = request.body;
        assetData.username = accountManager.getUsername(assetData.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (assetData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        // Add the asset through the Asset Manager and return the insertion data to the front-end
        logger.log(`User sent the following asset data:\n\n`, assetData);
        return assetManager.addAsset(assetData)
            .then((data) => response.send({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Add a new category. First check the credentials with the Account Manager
    // (whether the session id that the front-end provided is correct), then
    // add the category information for that particular username based on the data received
    expressApp.post("/add_category", (request, response) => {
        const categoryData = request.body;
        categoryData.username = accountManager.getUsername(categoryData.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (categoryData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        // Add the category through the Asset Manager and return the insertion data to the front-end
        logger.log(`User sent the following category data:\n\n`, categoryData);
        return assetManager.addCategory(categoryData)
            .then((data) => response.json({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Add a new site. First check the credentials with the Account Manager
    // (whether the session id that the front-end provided is correct), then
    // add the site information for that particular username based on the data received
    expressApp.post("/add_site", (request, response) => {
        const siteData = request.body;
        const siteObj = { 
            site_name: siteData.site_name, 
            locations: [ siteData.location_name ] 
        };

        logger.log(`User sent the following site data:\n\n`, siteData);

        siteObj.username = accountManager.getUsername(siteData.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (siteObj.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        // Add the site through the Asset Manager and return the insertion data to the front-end
        return assetManager.addSite(siteObj)
            .then((data) => response.send({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Add a new location. First check the credentials with the Account Manager
    // (whether the session id that the front-end provided is correct), then
    // add the location information for that particular username based on the data received
    expressApp.post("/add_location", (request, response) => {
        const locationData = request.body;
        logger.log(`User sent the following site data:\n\n`, locationData);
        locationData.username = accountManager.getUsername(locationData.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (locationData.username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        // Add the location through the Asset Manager and return the insertion data to the front-end
        return assetManager.addLocation(locationData)
            .then((data) => response.send({ success: true, data }))
            .catch((err) => response.send({ success: false, err: err.message }));
    });

    // Generate a report for a user through the Report Manager
    expressApp.post("/report", async (request, response) => {
        const params = request.body;
        const username = accountManager.getUsername(params.sessionId);

        // If the username retrieved from the session is null, then the session does not exist!
        if (username == null)
            return response.send({ success: false, err: `Session Id does not exist!` });

        try {
            // Generate the report through the Report Manager
            const report = reporter.generateReport(username);
            response.send({ success: true, data: report });

        } catch(err) {
            response.send({ success: false, err: err.message });
        }
    });
}

// Log in to a user's account, then get the user's asset data
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

// Fetch all of a user's data on the database
async function _getUserData(username)
{
    const data = {};
    data.assets = await assetManager.getFullAssets(username);
    data.categories = await assetManager.getAllCategories(username);
    data.sites = await assetManager.getAllSites(username);
    return data;
}