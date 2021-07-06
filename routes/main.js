
// Initialize all our end-points here
module.exports.initRoutes = function (expressApp)
{
    // Index end-point
    expressApp.get("/", (req, res) =>
    {
        res.send("Hello World!");
    });
}