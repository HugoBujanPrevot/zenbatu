const express = require("express");
const router = require("./routes/main");
const logger = require("./logger/logger");
const dbOperations = require("./database_integration/database_operations");

const app = express();
const port = 8089;


// Set http request parsers
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Make all files inside of the client folder accessible to the front-end
app.use(express.static(__dirname + "/client"));

// Set the views directory and views engine (we will use ejs)
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);


// Initialize our server app with all the routes
router.initRoutes(app);

// Start listening for connections
app.listen(port, () => logger.log(`App listening on port ${port}`));

// Establish database connection
dbOperations.connect("2600:1700:9e00:6cf0:a887:baf7:3cc8:95b8", "test_user", "test");