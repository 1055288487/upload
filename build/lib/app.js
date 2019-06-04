"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config = require('../../config.json'), DEBUG = require('debug'), debug = DEBUG('app:debug'), logError = DEBUG('app:error');
const path = require("path");
const utils_1 = require("./utils");
const tcpServer_1 = require("./tcpServer");
const service_1 = require("./service");
const fs = utils_1.default.fs, hash = utils_1.default.hash, crc32 = utils_1.default.crc32;
var replyCode;
(function (replyCode) {
    replyCode[replyCode["analyticalError"] = 500] = "analyticalError";
    replyCode[replyCode["checkCRCFail"] = 501] = "checkCRCFail";
    replyCode[replyCode["writeFileError"] = 502] = "writeFileError";
    replyCode[replyCode["cancel"] = 503] = "cancel";
    replyCode[replyCode["pause"] = 504] = "pause";
    replyCode[replyCode["maxLimitError"] = 505] = "maxLimitError";
    replyCode[replyCode["success"] = 200] = "success";
    replyCode[replyCode["complete"] = 304] = "complete";
})(replyCode || (replyCode = {}));
;
var cmd;
(function (cmd) {
    cmd[cmd["normal"] = 1] = "normal";
    cmd[cmd["pause"] = 2] = "pause";
    cmd[cmd["cancel"] = 3] = "cancel";
})(cmd || (cmd = {}));
;
class default_1 {
    start() {
        if (this.server)
            return;
        logError('error log enabled');
        debug('debug log enabled');
        this.server = new tcpServer_1.default(config.serverPort || 8124, (client, data) => __awaiter(this, void 0, void 0, function* () {
            yield this.onData(client, data);
        }));
        this.server.on('onstart', debug);
        this.server.start();
    }
    onData(client, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let me = this;
            let pg = this.parseProtocol(data);
            debug('>>文件上传：%j', pg.protocol);
            let checkRet = this.check(pg);
            if (!checkRet.success) {
                return this.reply(client, checkRet);
            }
            let md5 = pg.protocol.md5;
            let file = yield service_1.default.findFile(md5);
            if (file) {
                file.hitTimes++;
                file.lastHitDate = Date.now();
                yield service_1.default.updateFile(md5, file);
                debug('文件：%j 存在，秒传。', pg.protocol);
                return me.reply(client, { success: true, code: replyCode.complete, message: 'The transfer is complete, disconnect.', accept: pg.protocol.fileLength });
            }
            let progress = yield service_1.default.findProgress(md5);
            if (progress && progress.offset !== pg.protocol.offset) {
                debug('文件 %s/%s 存在，同步文件上传进度 %s.', pg.protocol.md5, pg.protocol.fileName, progress.offset);
                return this.reply(client, { success: true, code: replyCode.success, message: 'ok.', accept: progress.offset });
            }
            let dir = path.join(config.storage.path, fs.md5toPath(md5));
            let mkdirRet = yield fs.mkdir(dir);
            if (!mkdirRet) {
                logError('创建文件夹 %s 异常，传输失败。', dir);
                return me.reply(client, { success: false, code: replyCode.writeFileError, message: 'ok', accept: pg.protocol.offset + pg.buffer.byteLength });
            }
            let tempPath = dir + md5 + '.temp';
            let savePath = dir + md5 + config.storage.extension;
            let tempFileExists = yield fs.exists(tempPath);
            if (pg.protocol.offset !== 0 && !tempFileExists) {
                debug('临时文件 %s/%s 不存在，同步客户端进度从0开始。', tempPath, pg.protocol.fileName);
                return this.reply(client, { success: true, code: replyCode.success, message: 'ok.', accept: 0 });
            }
            fs.wirte(tempPath, pg.buffer, pg.protocol.offset, () => __awaiter(this, void 0, void 0, function* () {
                let receiveLen = pg.protocol.offset + pg.bufferLength;
                if (receiveLen < pg.protocol.fileLength) {
                    yield service_1.default.saveProgress({ md5: md5, length: pg.protocol.fileLength, offset: receiveLen, createDate: Date.now() });
                    return me.reply(client, { success: true, code: replyCode.success, message: 'ok', accept: receiveLen });
                }
                if (receiveLen > pg.protocol.fileLength) {
                    logError('文件接收长度大于协议中描述的文件长度:%j', receiveLen, pg.protocol);
                    yield service_1.default.deleteProgress(md5);
                    let deleteTempRet = yield fs.delete(tempPath);
                    logError('临时文件 %s 删除，结果:%s', tempPath, deleteTempRet);
                    return me.reply(client, { success: false, code: replyCode.writeFileError, message: '文件大小不一致', accept: pg.protocol.offset + pg.buffer.byteLength });
                }
                yield service_1.default.deleteProgress(md5);
                let fileMD5 = yield hash.md5(tempPath);
                if (md5 !== fileMD5) {
                    logError('文件 %s 传输完成，但文件MD5校验失败，protocol md5:%s / current md5:%s', pg.protocol.fileName, md5, fileMD5);
                    let deleteTempRet = yield fs.delete(tempPath);
                    logError('临时文件 %s 删除，结果:%s', tempPath, deleteTempRet);
                    return me.reply(client, { success: false, code: replyCode.writeFileError, message: 'MD5校验失败。', accept: pg.protocol.offset + pg.buffer.byteLength });
                }
                let renameRet = yield fs.rename(tempPath, savePath);
                if (!renameRet) {
                    let delTempRet = yield fs.delete(tempPath);
                    logError('文件重命名失败,临时文件 %s 删除结果：%s', tempPath, delTempRet);
                    return me.reply(client, { success: false, code: replyCode.writeFileError, message: '文件重命名失败', accept: pg.protocol.offset + pg.buffer.byteLength });
                }
                let result = yield service_1.default.create({
                    md5: md5,
                    fileName: pg.protocol.fileName,
                    user: pg.protocol.user,
                    client: pg.protocol.client,
                    length: pg.protocol.fileLength,
                    path: savePath,
                    createDate: Date.now(),
                    hitTimes: 1,
                    lastHitDate: Date.now()
                });
                if (!result) {
                    return me.reply(client, { success: false, code: replyCode.writeFileError, message: '文件上传失败', accept: 0 });
                }
                debug('文件上传成功，%j', pg.protocol);
                return me.reply(client, { success: true, code: replyCode.complete, message: 'ok', accept: pg.protocol.offset + pg.buffer.byteLength });
            }), () => {
            }, (err) => {
                logError('文件 %s 写入异常 %s', savePath, err);
                me.reply(client, { success: false, code: replyCode.writeFileError, message: '', accept: pg.protocol.offset });
            });
        });
    }
    parseProtocol(data) {
        let index = 0;
        let total = data.readInt32LE(index);
        index = index + 4;
        let protocolLength = data.readInt32LE(index);
        index = index + 4;
        let protocolContent = data.toString('utf8', index, protocolLength + index);
        let protocol = JSON.parse(protocolContent);
        index += protocolLength;
        let dataLength = data.readUInt32LE(index);
        index = index + 4;
        let fileBuff = data.slice(index);
        return {
            protocol: protocol,
            buffer: fileBuff,
            bufferLength: dataLength
        };
    }
    check(p) {
        let crc = crc32.crc32Buffer(p.buffer);
        let command = p.protocol.cmd;
        if (command === cmd.pause) {
            return { success: false, code: replyCode.pause, message: '传输暂停', accept: 0 };
        }
        if (command === cmd.cancel) {
            return { success: false, code: replyCode.cancel, message: '取消文件传输', accept: 0 };
        }
        if (p.buffer.byteLength !== p.bufferLength || !p.protocol.md5 || p.protocol.md5.length !== 32) {
            logError('解析包失败:%j', p.protocol);
            return { success: false, code: replyCode.analyticalError, message: '解析包失败', accept: 0 };
        }
        if (!p.protocol.crc || crc !== p.protocol.crc.toUpperCase()) {
            logError('crc校验失败:%j', p.protocol);
            return { success: false, code: replyCode.checkCRCFail, message: 'crc校验失败', accept: 0 };
        }
        if (p.protocol.fileLength > config.storage.maxLength) {
            return { success: false, code: replyCode.maxLimitError, message: '文件超出最大限制', accept: 0 };
        }
        p.protocol.md5 = p.protocol.md5.toLowerCase();
        p.protocol.user = p.protocol.user || { sender: '', receiver: '' };
        p.protocol.client = p.protocol.client || { name: '', version: 0 };
        return { success: true, code: 0, message: '' };
    }
    reply(client, data) {
        let message = JSON.stringify(data);
        let len = Buffer.byteLength(message);
        let buff = new Buffer(4 + len);
        let offset = 0;
        buff.writeUInt32LE(len, offset);
        offset = offset + 4;
        buff.write(message, offset, len, 'utf8');
        debug('回复消息 length:%d message: %s', len, message);
        client.write(buff);
    }
}
exports.default = default_1;
//# sourceMappingURL=app.js.map