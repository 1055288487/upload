const config = require('../../config.json'),
    DEBUG = require('debug'),
    debug = DEBUG('app:debug'),
    logError = DEBUG('app:error');

import * as path from 'path';
import * as net from 'net';
import utils from './utils';
import TCPServer from './tcpServer';
import service from './service';
import { IPackage, IProtocol, IReply } from './types';
const fs = utils.fs, hash = utils.hash, crc32 = utils.crc32;

enum replyCode {
    analyticalError = 500, //解析包失败
    checkCRCFail = 501,    //文件包校验失败
    writeFileError = 502, //文件写入失败
    cancel = 503, //取消传输
    pause = 504, //暂停
    maxLimitError = 505,//文件超出最大限制,
    success = 200,  //文件块写成功
    complete = 304   //传输完成
};

enum cmd {
    normal = 1,//    1(正常传输)
    pause = 2,//    2（暂停）
    cancel = 3//    3（取消）
};

export default class {
    server: TCPServer;

    start() {
        if (this.server) return;

        logError('error log enabled');
        debug('debug log enabled');

        this.server = new TCPServer(config.serverPort || 8124, async (client: net.Socket, data: Buffer) => {
            await this.onData(client, data);
        });

        this.server.on('onstart', debug);
        this.server.start();

    }

    async onData(client: net.Socket, data: Buffer) {
        let me = this;
        let pg: IPackage = this.parseProtocol(data);
        debug('>>文件上传：%j', pg.protocol);
        let checkRet: IReply = this.check(pg); //校验包的合法性
        if (!checkRet.success) {
            return this.reply(client, checkRet);
        }
        let md5 = pg.protocol.md5;
        let file = await service.findFile(md5); //从数据库里查询文件是否已经存在
        if (file) {
            file.hitTimes++;
            file.lastHitDate = Date.now();
            await service.updateFile(md5, file);
            debug('文件：%j 存在，秒传。', pg.protocol);
            return me.reply(client, { success: true, code: replyCode.complete, message: 'The transfer is complete, disconnect.', accept: pg.protocol.fileLength });
        }

        //判断当前传输的位置，
        let progress = await service.findProgress(md5);
        //debug('%s - progress:%j', md5, progress || {});
        if (progress && progress.offset !== pg.protocol.offset) {        //如果当前文件位置不等于协议的位置，则发送Offset指令
            debug('文件 %s/%s 存在，同步文件上传进度 %s.', pg.protocol.md5, pg.protocol.fileName, progress.offset);
            return this.reply(client, { success: true, code: replyCode.success, message: 'ok.', accept: progress.offset });
        }


        let dir = path.join(config.storage.path, fs.md5toPath(md5));
        let mkdirRet = await fs.mkdir(dir);
        if (!mkdirRet) {
            logError('创建文件夹 %s 异常，传输失败。', dir);
            return me.reply(client, { success: false, code: replyCode.writeFileError, message: 'ok', accept: pg.protocol.offset + pg.buffer.byteLength });
        }
        let tempPath = dir + md5 + '.temp';

        let savePath = dir + md5 + config.storage.extension;
        let tempFileExists = await fs.exists(tempPath);
        if (pg.protocol.offset !== 0 && !tempFileExists) {
            debug('临时文件 %s/%s 不存在，同步客户端进度从0开始。', tempPath, pg.protocol.fileName);
            return this.reply(client, { success: true, code: replyCode.success, message: 'ok.', accept: 0 });
        }

        fs.wirte(tempPath, pg.buffer, pg.protocol.offset, async () => {

            //debug('on Finish 文件写入完成。');
            let receiveLen = pg.protocol.offset + pg.bufferLength;

            if (receiveLen < pg.protocol.fileLength) {
                await service.saveProgress({ md5: md5, length: pg.protocol.fileLength, offset: receiveLen, createDate: Date.now() });
                return me.reply(client, { success: true, code: replyCode.success, message: 'ok', accept: receiveLen });
            }

            if (receiveLen > pg.protocol.fileLength) {
                logError('文件接收长度大于协议中描述的文件长度:%j', receiveLen, pg.protocol);
                await service.deleteProgress(md5);
                let deleteTempRet = await fs.delete(tempPath);
                logError('临时文件 %s 删除，结果:%s', tempPath, deleteTempRet);
                return me.reply(client, { success: false, code: replyCode.writeFileError, message: '文件大小不一致', accept: pg.protocol.offset + pg.buffer.byteLength });
            }

            //传输完成
            await service.deleteProgress(md5);
            let fileMD5 = await hash.md5(tempPath);
            if (md5 !== fileMD5) {
                logError('文件 %s 传输完成，但文件MD5校验失败，protocol md5:%s / current md5:%s', pg.protocol.fileName, md5, fileMD5);
                let deleteTempRet = await fs.delete(tempPath);
                logError('临时文件 %s 删除，结果:%s', tempPath, deleteTempRet);
                return me.reply(client, { success: false, code: replyCode.writeFileError, message: 'MD5校验失败。', accept: pg.protocol.offset + pg.buffer.byteLength });
            }
            let renameRet = await fs.rename(tempPath, savePath);
            if (!renameRet) {
                let delTempRet = await fs.delete(tempPath);
                logError('文件重命名失败,临时文件 %s 删除结果：%s', tempPath, delTempRet);
                return me.reply(client, { success: false, code: replyCode.writeFileError, message: '文件重命名失败', accept: pg.protocol.offset + pg.buffer.byteLength });
            }
            let result = await service.create({
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

        }, () => {
            // debug('文件已经关闭：%s', savePath);
        }, (err: Error) => {
            logError('文件 %s 写入异常 %s', savePath, err);
            me.reply(client, { success: false, code: replyCode.writeFileError, message: '', accept: pg.protocol.offset });
        });
    }

    parseProtocol(data: Buffer): IPackage {
        let index = 0;
        let total = data.readInt32LE(index);

        index = index + 4;
        let protocolLength = data.readInt32LE(index);

        index = index + 4;
        let protocolContent = data.toString('utf8', index, protocolLength + index);

        let protocol: IProtocol = JSON.parse(protocolContent);
        index += protocolLength;
        let dataLength = data.readUInt32LE(index);

        index = index + 4;
        let fileBuff: Buffer = data.slice(index);

        return {
            protocol: protocol,
            buffer: fileBuff,
            bufferLength: dataLength
        };
    }

    check(p: IPackage): IReply {
        let crc = crc32.crc32Buffer(p.buffer);

        let command = p.protocol.cmd;
        if (command === cmd.pause) {
            // debug('%s - 传输暂停', p.protocol.fileName);
            return { success: false, code: replyCode.pause, message: '传输暂停', accept: 0 };
        }

        if (command === cmd.cancel) {
            // debug('%s - 取消文件传输', p.protocol.fileName);
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
            // logError('文件超出最大限制:%j', p.protocol);     
            return { success: false, code: replyCode.maxLimitError, message: '文件超出最大限制', accept: 0 };
        }

        p.protocol.md5 = p.protocol.md5.toLowerCase();
        p.protocol.user = p.protocol.user || { sender: '', receiver: '' };
        p.protocol.client = p.protocol.client || { name: '', version: 0 };
        return { success: true, code: 0, message: '' };
    }

    reply(client: net.Socket, data: IReply) {

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