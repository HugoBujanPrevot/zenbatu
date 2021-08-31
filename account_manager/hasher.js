const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;


module.exports.hash = (str) => {
    return new Promise((resolve, reject) => {
        bcrypt.hash(str, SALT_ROUNDS, (err, hash) => {
            if (err) return reject(err);
            else return resolve(hash);
        });
    });
};

module.exports.comparePasswordToHash = (str, storedHash) => {
    return new Promise((resolve, reject) => {
        bcrypt.compare(str, storedHash, (err, result) => {
            if (err) return reject(err);
            else return resolve(result);
        });
    })
};