
const fs = require("fs");
const express = require("express");
const router = require("./routes/main");
const logger = require("./logger/logger");
const open = require("open");
const path = require("path");
const process = require("process");
const dbOperations = require("./database_integration/database_operations");

const app = express();
const port = 8089;
const URL = `http://localhost:${port}`;


// Set http request parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Make all files inside of the client folder accessible to the front-end
app.use(express.static(path.resolve(process.cwd(), "./client")));

// Set the views directory and views engine (we will use ejs)
app.set("views", path.resolve(process.cwd(), "./views"));
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);


// Initialize our server app with all the routes
router.initRoutes(app);

// Start listening for connections
app.listen(port, () => logger.log(`App listening on port ${port}`));

// Establish database connection
dbOperations.connect("192.81.130.83", "test_user", "zenb@tu")
.then(() => 
{
    logger.log(`App connected successfully, launching browser @ ${URL}...`);
    open(URL);
})
.catch((err) => logger.log(`Error connecting to database: ${err.message}\n\n${err.stack}`));


process.on('uncaughtException', err => 
{
    fs.writeFileSync(path.resolve(process.cwd(), "./error.txt"), `${err.message}\n\n${err.stack}`); 
});