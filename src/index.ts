
import utils from './lib/utils';
import App from './lib/app';
const config = require('../config.json');
// const easyMonitor = require('easy-monitor');

(async function () {
    //easyMonitor('wfs');
    await utils.pid.save('./app.pid');
    const app = new App();
    app.start();
}());

