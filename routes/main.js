
// Initialize all our end-points here
export function initRoutes(expressApp)
{
    // Index end-point
    expressApp.get("/", (req, res) =>
    {
        res.send("Hello World!");
    });
}