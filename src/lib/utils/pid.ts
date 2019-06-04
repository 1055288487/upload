const debug = require('debug')('pid');
import fs from './fs';
export default class {
    static async save(path: string) {
        path = path;
        let pid: string = process.pid.toString();
        let ret: boolean = await fs.writeFile(path, pid);
        debug('%s save to:%s,result: %s', pid, path, ret ? 'success' : 'error');
    }
}