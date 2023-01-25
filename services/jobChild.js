const path             = require('path');
const utilsDB          = require('../utils/database');
const NSErrors         = require('../utils/errors/NSErrors');
const {stringifyError} = require('../utils/utils');

/**
 * Init child process Globals and Database
 */
const initChildProcess = async () => {
    try {
        global.aquila = global.aquila ? global.aquila : JSON.parse(Buffer.from(process.argv[3], 'base64').toString('utf8'));
        await utilsDB.connect();
    } catch (err) {
        console.error(err);
        throw NSErrors.InitChildProcessError;
    }
};

(async () => {
    try {
        await initChildProcess();
        const {funcName, modulePath, option} = JSON.parse(Buffer.from(process.argv[2], 'base64').toString('utf8'));
        const response                       = await require(path.join(global.aquila.appRoot, modulePath))[funcName](option);
        if (response) process.send(response);
        process.exit(0);
    } catch (error) {
        console.error(error);
        if (error) {
            const message = typeof error === 'string' ? error : stringifyError(error, null, '\t');
            process.send(message);
        }
        // const message = typeof error === 'string' ? error : JSON.stringify(error, Object.getOwnPropertyNames(error));
        process.exit(1);
    }
})();