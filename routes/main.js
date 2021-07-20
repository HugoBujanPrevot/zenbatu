
// Initialize all our end-points here
module.exports.initRoutes = function (expressApp)
{
    // Index end-point; i.e. this is what sends our home page to user when they
    // connect to the right address on the browser (in dev phase, localhost:8089)
    expressApp.get("/", (req, res) =>
    {
        res.send("Hello World!");
    });
}