const fs = require('fs');
const { promisify } = require('util');

const exists = promisify(fs.exists),
    rename = promisify(fs.rename);



//console.log('dir:',__dirname);

(async function () {
    try {

        let existsResult = await exists(__filename)
        console.log('exists:', existsResult);

        await rename(__dirname + '/crc_test.js', __dirname + '/crc.js')
        console.log('rename success.');
    } catch (err) {
        console.error('rname exception:\n%s', err);
    };
}());
