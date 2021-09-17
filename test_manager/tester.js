
const logger = require("../logger/logger");
const reportManager = require("../report_manager/reporter");
const assetManager = require("../asset_manager/asset_manager");
const accountManager = require("../account_manager/account_manager");
const dbOperations = require("../database_integration/database_operations");
const { DbOperationError } = require("../errors/custom_errors");



exports.runTestSuite = async (dbAddress) =>
{
    try {
        logger.log(`Running DB Connection Test...`);
        await _testDbConnection(dbAddress);
        logger.log(`DB Connection Test Passed!`);

        logger.log(`Running Bad Username Test...`);
        await _testBadUsername();
        logger.log(`Bad Username Test Passed!`);
        
        logger.log(`Running Bad Password Test...`);
        await _testBadPassword();
        logger.log(`Bad Password Test Passed!`);
        
        logger.log(`Running Create Account Test...`);
        await _testCreateAccount();
        logger.log(`Create Account Test Passed!`);
        
        logger.log(`Running Get Assets Test...`);
        await _testGetAssets();
        logger.log(`Get Assets Test Passed!`);
        
        logger.log(`Running Generate Report Test...`);
        await _testGenerateReport();
        logger.log(`Generate Report Test Passed!`);

    } catch(err) {
        
        logger.log(`Test Suite FAILED to complete!`, err);
    }
};


function _testDbConnection(dbAddress)
{
    dbOperations.createConnection(dbAddress, "test_user", "test");
    
    return dbOperations.connect()
    .catch((err) => Promise.reject(new DbOperationError(`DB Connection Test Failed: ${err.message}\n\n${err.stack}`)));
}

async function _testBadUsername()
{
    try {
        const signUpResult = await accountManager.signUp("te", "test");
        throw new Error(`Username less than 3 character should NOT be accepted.`);

    } catch(err) {

        if (err.name === "LoginError")
            return true;

        else throw new Error(`Bad Username Test Failed Unexpectedly: ${err.message}\n\n${err.stack}`);
    }
}

async function _testBadPassword()
{
    try {
        const signUpResult = await accountManager.signUp("test", "te");
        return new Error(`Password less than 3 character should NOT be accepted.`);

    } catch(err) {

        if (err.name === "LoginError")
            return true;

        else throw new Error(`Bad Password Test Failed Unexpectedly: ${err.message}\n\n${err.stack}`);
    }
}

async function _testCreateAccount()
{
    const signUpResult = await accountManager.signUp("Tester", "test");
    const logInResult = await accountManager.logIn("Tester", "test");
    return true;
}

async function _testGetAssets()
{
    try {
        const fullAssets = await assetManager.getFullAssets();
        return true;

    } catch(err) {
        throw new Error(`Get Assets Test Failed: ${err.message}\n\n${err.stack}`);
    }
}

async function _testGenerateReport()
{
    try {
        const report = await reportManager.generateReport();
        return true;

    } catch(err) {
        throw new Error(`Generate Report Test Failed: ${err.message}\n\n${err.stack}`);
    }
}