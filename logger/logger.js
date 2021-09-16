
/**
 * This module takes care of all the console and file logging
 * throughout the application, with custom formatting to properly
 * indent json data displayed in the logs
 */

// Required modules
const fs = require("fs");
const path = require("path");
const fsp = require("fs").promises;

// The path in which the log file will be created
const LOG_PATH = path.resolve(process.cwd(), "./log.txt");

// The default indent amount of new lines of data
const INDENT = "  ";

// Ensure the log file exists by writing a new one
fs.writeFileSync(LOG_PATH, "");

// Formats the given message and data passed, and logs
// them both to the console and the log file
module.exports.log = async (message, ...data) => {
    // Create our log string with the message
    var str = message + "\n";

    // Format all the data passed to the function as rest parameters
    data.forEach((line) => {
        // If a complex object, then use a helper function to
        // iterate through it and create an indented string
        if (typeof line === "object")
            str += "\n" + _indentJSON(line);

        // Otherwise just indent it and stringify it in a line
        else str += `\n${INDENT}${line}`;
    });

    // Log it and append it to file
    console.log(str);
    await fsp.appendFile(LOG_PATH, `${str}\n\n`);
};


// Stringify a json object with full indentation
function _indentJSON(obj) {
    // Replace the normal stringification if the object is an Error,
    // otherwise they will show as empty {} objects
    const jsonStr = JSON.stringify(obj, function replacer(objKey, objValue) {
        const err = {};

        if (objValue instanceof Error) {
            Object.getOwnPropertyNames(objValue).forEach((key) => err[key] = objValue[key]);
            return err;
        }

        return objValue;

    }, 2);

    // Split the resulting JSON string by newlines and/or escaped newlines
    const split = jsonStr.split(/\n|\\n/g);

    // Rejoin them with added indentation
    return INDENT + split.join(`\n${INDENT}`) + "\n";
}