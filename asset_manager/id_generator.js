
/**
 * This module is a wrapper for the npm package to generate
 * uuids, i.e. unique identification numbers used to store
 * assets on the database or to create session ids
 * https://www.npmjs.com/package/uuid
 */

const uuid = require("uuid").v4;

// Call the package's main function to generate a new id
module.exports.generateId = () => uuid();