
const express = require("express");
const router = require("./routes/main");

const app = express();
const port = 8089;


// Set http request parsers
express.json();
express.urlencoded({ extended: true });

// Make all files inside of the client folder accessible to the front-end
app.use(express.static(__dirname + "/client"));

// Set the views directory
app.set("views", __dirname + "/views");

// Initialize our server app with all the routes
router.initRoutes(app);

// Start listening for connections
app.listen(port, () => console.log(`Listening on port ${port}`));