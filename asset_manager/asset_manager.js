
const idGenerator = require("./id_generator");
const dbOperations = require("../database_integration/database_operations");


module.exports.addAsset = (assetData) =>
{
    const assetDataWithId = Object.assign(assetData, { asset_id: idGenerator.generateId() });

    return dbOperations.addAsset(assetDataWithId)
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