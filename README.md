# Zenbatu
Asset-tracking and management application designed for University of London Goldsmith's Agile Software Development module. The project uses a MySQL database for data-storage (and its corresponding NodeJS module), NodeJS and Express for the business logic, and EJS to do server-side templating.


## How to Contribute
To start contributing, make sure you install [Git](https://git-scm.com/downloads) and [NodeJS](https://nodejs.org/en/download/). Once these are installed, follow the steps below:

1. Open a command line console wherever you want to keep the project (shift+right click on a folder on Windows, then "Open Powershell window here"), and type `git clone https://github.com/HugoBujanPrevot/zenbatu`.
2. Once the repository is cloned, in the same console window, type `npm install`. This will automatically install all of the required node packages specified in the package.json file.
3. You can start working on the project now. If you don't know how to use Git, there are a few [guides](https://github.com/git-guides) that can help.

## How to Package the App into an Exe file
The pkg module is included in the application. If you followed the steps above and ran the `npm install` command, you can open a cmd window on the directory of the repository and run the command `pkg zenbatu.js`. This will package the application into an executable file for each platform that you can then run.

## How to Run the App
To run the application, once NodeJS is installed, you can use the same console window that was mentioned above to run the command "node index.js". This will launch a browser window with the app's front-end. If you're using Visual Studio Code (which I recommend) as your IDE, you can also use its built-in terminal to run these commands (got to Terminal at the top, then 'New Terminal').


## Project Structure
The application starts at the index.js file. This file initializes the Express server to serve the front-end files (located within the /views folder) to incoming connections. 

Every file within /views is either a view (a web page), or a partial (a chunk of a page, like a navbar; these are used to embed them within views and not have to repeat the same code over and over). Both views and partials are in the [EJS](https://ejs.co/) format; regular HTML code but with JavaScript added to it for server-side rendering. What this means is that before the HTML code is sent to the client to display on the browser, the server will process the EJS code and add in any data that is passed to it, turning it into the final HTML page sent to the client.

The /router folder contains the code files that define the end-points of the application; i.e. how the program responds to HTTP requests. For example, when a client first connects to the IP address through the browser, a GET request will be sent, which the files in /router receive. This is how the front-end requests data from the back-end. For example, if the front-end needs to load a list of assets, it will send a GET request to the end-point "/get_assets" (or whichever has been defined), and the back-end will process that request, fetch the asset data from the database, and respond to the request with the data. Overall, the code within the /router folder should mostly only interact with our manager modules (Asset, Account and Report Managers, as outlined in our diagram). Essentially, it takes care of routing the client requests to the right place in the code.

The /database_integration is the package where all database-related code happens. The file database_connection.js is a module that encapsulates the [creation of a connection object](https://www.w3schools.com/nodejs/nodejs_mysql.asp). This module should **only** be used by the database_operations.js module. This is what acts as an interface for the databases queries. In short, it defines a series of functions to interact with the database, each of them with a corresponding SQL query. The database_initializer.js is the module that gets called when someone connects to the database for the first time. It ensures that the basic database structure exists (i.e. all of the tables).

The /asset_manager, /account_manager and /report_manager are the packages that will do the heavy lifting for the business logic. They will interact with the database_operations module to fetch, update and delete database records, and with the /router to return the adequate data to be sent back to a client's request.

Finally, the /client folder contains all client-side content, like the CSS stylesheets or front-end JavaScript code that runs directly on the client's browser. As such, no other module in the application has direct access to this code, and vice-versa. They occur on two separate sides: on the machine hosting the server for everything outside of /client, and on the user's browser for the code within /client.

