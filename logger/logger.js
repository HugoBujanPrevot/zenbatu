
const fs = require("fs");
const fsp = require("fs").promises;

const LOG_PATH = "./log.txt";
const INDENT = "  ";

fs.writeFileSync(LOG_PATH, "");

module.exports.log = async (message, ...data) =>
{
    var str = message + "\n";

    data.forEach((line) =>
    {
        if (typeof line === "object")
            str += "\n" + _indentJSON(line);

        else str += `\n${INDENT}${line}`;
    });

    console.log(str);
    await fsp.appendFile(LOG_PATH, `${str}\n\n`);
};


// Stringify a json object with full indentation
function _indentJSON(obj)
{
    // Replace the normal stringification if the object is an Error,
    // otherwise they will show as empty {} objects
    const jsonStr = JSON.stringify(obj, function replacer(objKey, objValue)
    {
        const err = {};

        if (objValue instanceof Error)
        {
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