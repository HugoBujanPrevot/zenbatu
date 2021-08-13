
const dbOperations = require("../database_integration/database_operations");

const MS_IN_DAY = 86400000;
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const DAYS_IN_QUARTER = 91;
const DAYS_IN_YEAR = 365;


// Fetch all assets in the database, as well as all their information,
// and generate a report on whether their maintenance is due, as well
// as their current value given their useful lifespan and whether
// the asset has exceeded its useful life
module.exports.generateReport = async function()
{
    const assets = dbOperations.getFullAssets();
    const report = [];

    assets.forEach((asset) =>
    {
        const assetReport = {
            needsMaintenance:       _doesAssetNeedMaintenance(asset),
            currentValue:           _getCurrentAssetValue(asset),
            hasExceededLifespan:    _hasAssetExceededLifespan(asset)
        };

        report.push(assetReport);
    });

    return report;
};


// Calculate how many days have passed since the asset's last maintenance
function _getDaysSinceLastMaintenance(asset)
{
    const now = Date.now();
    const lastMaintenanceDate = new Date(asset.last_maintenance_date);
    console.log(`Asset ${asset.name}'s last maintenance date is ${lastMaintenanceDate}`);

    const msSinceMaintenance = now - lastMaintenanceDate.getMilliseconds();
    const daysSinceMaintenance = Math.floor(msSinceMaintenance / MS_IN_DAY);
    console.log(`Asset ${asset.name}'s days since last maintenance date are ${daysSinceMaintenance}`);


    return daysSinceMaintenance;
}

// Calculate how many days have passed since the asset's purchase date
function _getDaysSincePurchase(asset)
{
    const now = Date.now();
    const purchaseDate = new Date(asset.purchase_date);
    const msSincePurchase = now - purchaseDate.getMilliseconds();
    const daysSincePurchase = Math.floor(msSincePurchase / MS_IN_DAY);
    console.log(`Asset ${asset.name}'s days since purchase are ${daysSincePurchase}`);

    return daysSincePurchase;
}


// Calculate an asset's current value given its useful lifespan, the date
// at which it was bought, and the price for which it was bought at the time
function _getCurrentAssetValue(asset)
{
    const purchaseValue = asset.cost;
    const usefulLife = asset.useful_life;
    const usefulLifeInDays = usefulLife * DAYS_IN_YEAR;

    // An asset without a useful lifespan of more than 1 year is worthless after purchase
    if (usefulLife === 0)
        return 0;
        
    // Work out the asset's daily value decay rate based on its lifespan and original cost
    const dailyDecay = cost / usefulLifeInDays;
    console.log(`Asset ${asset.name}'s daily value decay is ${dailyDecay}`);

    // Work out the days that have passed since the purchase of the asset
    const daysSincePurchase = _getDaysSincePurchase(asset);

    // Work out the current value taking into account the original cost, the daily decay
    // in price and the days since the purchase was made
    const currentValue = purchaseValue - ( dailyDecay * daysSincePurchase );
    console.log(`Asset ${asset.name}'s current value is ${currentValue}`);

    return currentValue;
}


// Figure out whether the asset has exceeded its lifespan by comparing its useful life
// to the number of years that passed since it was last acquired
function _hasAssetExceededLifespan(asset)
{
    const daysSincePurchase = _getDaysSincePurchase(asset);
    const yearsSincePurchase = Math.floor(daysSincePurchase / DAYS_IN_YEAR);
    console.log(`Asset ${asset.name}'s years since purchase are ${yearsSincePurchase}`);

    if (yearsSincePurchase > asset.useful_life)
        return true;

    else return false;
}

// Figure out whether the maintenance schedule of the asset and the days that
// passed since its last maintenance warrant a new maintenance session
function _doesAssetNeedMaintenance(asset)
{
    const daysSinceMaintenance =_getDaysSinceLastMaintenance(asset);
    const maintenanceSchedule = asset.maintenance_schedule;

    if (maintenanceSchedule === "daily")
    {
        if (daysSinceMaintenance >= 1) return true;
        else return false;
    }

    if (maintenanceSchedule === "weekly")
    {
        if (daysSinceMaintenance >= DAYS_IN_WEEK) return true;
        else return false;
    }
    
    else if (maintenanceSchedule === "biweekly")
    {
        if (daysSinceMaintenance >= DAYS_IN_WEEK * 2) return true;
        else return false;
    }
    
    else if (maintenanceSchedule === "monthly")
    {
        if (daysSinceMaintenance >= DAYS_IN_MONTH) return true;
        else return false;
    }
    
    else if (maintenanceSchedule === "bimonthly")
    {
        if (daysSinceMaintenance >= DAYS_IN_MONTH * 2) return true;
        else return false;
    }
    
    else if (maintenanceSchedule === "quarterly")
    {
        if (daysSinceMaintenance >= DAYS_IN_QUARTER) return true;
        else return false;
    }
    
    else if (maintenanceSchedule === "annually")
    {
        if (daysSinceMaintenance >= DAYS_IN_YEAR) return true;
        else return false;
    }

    else return false;
}