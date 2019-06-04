import utils from '../lib/utils';
const fs = utils.fs;
const debug = require('debug')('fs-test');

(async function () {

    const path = __dirname + '/test.txt';

    let ext = await fs.exists(__filename);
    debug('exists result:', ext);

    let wf = await fs.writeFile(path, 'hello_' + Date.now())
    debug('writeFile result:', wf);

    let readRet = await fs.readFile<string>(path);
    debug('read result:', readRet);

    let md5Ret = await fs.md5(path);
    debug('md5 result:', md5Ret);

    let deleteRet = await fs.delete(path);
    debug('deleteRet:', deleteRet);

    let mkdirRet = await fs.mkdir(__dirname  + fs.md5toPath(md5Ret));
    debug('mkdir result:', mkdirRet);

}());
