"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs'), crypto = require('crypto'), mkdirp = require('mkdirp'), { promisify } = require('util'), DEBUG = require('debug'), debug = DEBUG('fs:debug'), logError = DEBUG('fs:error');
const writeFileAsync = promisify(fs.writeFile), readFileAsync = promisify(fs.readFile), renameAsync = promisify(fs.rename), existsAsync = promisify(fs.exists), deleteAsync = promisify(fs.unlink), mkdirpAsync = promisify(mkdirp);
class default_1 {
    static mkdir(path) {
        return this.exists(path).then((e) => {
            if (e)
                return true;
            return mkdirpAsync(path).then((p) => {
                debug('mkdir %s success.', p);
                return true;
            }).catch((err) => {
                logError('mkdir Error:%s', err);
                return false;
            });
        });
    }
    static readFile(path, encoding = 'utf8') {
        return readFileAsync(path, { encoding: encoding, flag: 'r' }).then((data) => {
            return data;
        }).catch((err) => {
            logError('readFile Error:%s', err);
            return null;
        });
    }
    static delete(path) {
        return deleteAsync(path).then(() => true).catch((err) => {
            logError('delete Error:%s', err);
            return false;
        });
    }
    static exists(path) {
        return existsAsync(path);
    }
    static rename(sourcePath, dest) {
        return renameAsync(sourcePath, dest).then(() => true).catch((err) => {
            logError('rename error:%s', err);
            return false;
        });
    }
    static writeFile(filePath, data) {
        return writeFileAsync(filePath, data).then(() => true).catch((err) => {
            logError('writeFile Error:%s', err);
            return false;
        });
    }
    static wirte(filePath, buffer, offset, onFinish, onClose, onError) {
        let flag = offset == 0 ? 'w' : 'r+';
        let stream = fs.createWriteStream(filePath, {
            flags: flag,
            autoClose: true,
            start: offset
        });
        if (onClose)
            stream.on('close', onClose);
        stream.on('error', (err) => {
            stream.end();
            logError('stream ERROR:', err);
            if (onError)
                onError(err);
        });
        if (onFinish)
            stream.on('finish', onFinish);
        stream.write(buffer);
        stream.end();
    }
    static md5toPath(md5) {
        if (md5.length < 5)
            return '';
        let p = [], path = '';
        for (let i = 0; i < 5; i++)
            p.push(md5[i]);
        path = path + p.join('/');
        return '/' + path + '/';
    }
    static md5(filePath) {
        return new Promise((resolve, reject) => {
            let rs = fs.createReadStream(filePath), hash = crypto.createHash('md5');
            rs.on('readable', () => {
                var data = rs.read();
                if (data)
                    hash.update(data);
                else
                    resolve(hash.digest('hex'));
            });
            rs.on('error', reject);
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=fs.js.map