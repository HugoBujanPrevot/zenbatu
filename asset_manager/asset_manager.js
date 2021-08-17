
const dbOperations = require("../database_integration/database_operations");


module.exports.addAsset = (assetData) =>
{
    return dbOperations.addAsset(assetData)
    .catch((err) =>
    {
        console.log(err);
        return Promise.reject(new Error(`Error occurred when adding the asset to the database.`));
    });
};

module.exports.getAsset = ({name, id}) =>
{
    return dbOperations.getAsset((id != null) ? id : name)
    .catch((err) =>
    {
        console.log(err);
        return Promise.reject(new Error(`Error occurred when getting the asset from the database.`));
    });
};