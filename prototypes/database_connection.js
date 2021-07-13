
const mysql = require("mysql");


class DatabaseConnection {

    #db;
    #host;
    #user;

    /** Creates a connection instance to a database */
    constructor(hostIp, user, password)
    {
        this.#host = hostIp;
        this.#user = user;

        this.#db = mysql.createConnection({
            host: this.#host,
            user: this.#user,
            password: password
        });
    }

    get host()
    {
        return this.#host;
    }

    get user()
    {
        return this.#user;
    }

    /** Attempt to connect to the database and resolve the
     * promise if successful; otherwise reject it with an error
     */
    connect()
    {
        return new Promise((resolve, reject) =>
        {
            this.#db.connect((err) =>
            {
                if (err) reject(err);
                else resolve();
            });
        });
    }

    /** Send a query to the database and resolve its result,
     * or reject the promise with an error, if any.
     */
    query(...args)
    {
        return new Promise((resolve, reject) =>
        {
            db.query(...args, (err, result) =>
            {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }
}

module.exports = DatabaseConnection;