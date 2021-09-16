
/**
 * This is an auxiliary package (not created by us) found in the npm ecosystem
 * https://www.npmjs.com/package/bcrypt
 * 
 * It implements the bcrypt algorithm to hash passwords. This module is merely
 * a wrapper for it to be able to use Promises while calling its functions 
 */

// The actual npm package
const bcrypt = require("bcrypt");

// The number of salt rounds that will be made when hashing a password string
const SALT_ROUNDS = 10;

// Hash a password string and return a Promise
module.exports.hash = (str) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(str, SALT_ROUNDS, (err, hash) => {
            if (err) return reject(err);
            else return resolve(hash);
        });
    });
};

// Compare a password string to a given hash to check if they match,
// then return a Promise with the result
module.exports.comparePasswordToHash = (str, storedHash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(str, storedHash, (err, result) => {
            if (err) return reject(err);
            else return resolve(result);
        });
    })
};