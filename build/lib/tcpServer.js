"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const net = require("net");
const EventEmitter = require("events");
const DEBUG = require('debug'), debug = DEBUG('tcpserver:debug'), logError = DEBUG('tcpserver:error');
class default_1 extends EventEmitter {
    constructor(_port, _onData) {
        super();
        this.clientList = {};
        this.port = _port;
        this.onData = _onData;
    }
    start() {
        let me = this;
        this.server = net.createServer();
        this.server.on('connection', (client) => {
            this._onConnection(client);
        });
        this.server.on('error', this.onError);
        this.server.listen(this.port, () => {
            let address = me.server.address();
            this.emit('onstart', { address: address });
            debug('服务器已启动:', address);
        });
    }
    _onConnection(client) {
        let me = this;
        client.name = client.remoteAddress + ':' + client.remotePort;
        client.maps = {};
        client.maps.buffers = [];
        client.maps.total = 0;
        me.clientList[client.name] = client;
        client.on('data', (data) => {
            if (client.maps.total == 0) {
                client.maps.total = data.readUInt32LE(0);
            }
            client.maps.buffers.push(data);
            let buff = Buffer.concat(client.maps.buffers);
            let buffLen = buff.length;
            if (buffLen == client.maps.total) {
                client.maps = {};
                client.maps.buffers = [];
                client.maps.total = 0;
                this.onData(client, buff);
            }
            else if (buffLen > client.maps.total) {
                logError('数据包异常，断开连接。');
                client.end();
                delete this.clientList[client.name];
            }
        });
        client.on('close', () => {
            debug('client is closed. ');
            me.emit('client_close');
        });
        client.on('error', (error) => {
            if (error) {
                logError('client error', error.stack);
            }
            else {
                logError('%s出现异常错误，断开连接。', client.name);
            }
            logError('%s出现异常，断开连接。', client.name);
            client.end();
            delete me.clientList[client.name];
            debug('当前连接数：%d', Object.keys(me.clientList).length);
        });
        client.on('end', () => {
            debug('服务器已断开,删除客户端:%s', client.name);
            delete me.clientList[client.name];
            debug('当前连接数：%d', Object.keys(me.clientList).length);
        });
    }
    onError(e) {
        if (e.code == 'EADDRINUSE') {
            logError('地址被占用.');
        }
        console.error(e.stack);
    }
}
exports.default = default_1;
//# sourceMappingURL=tcpServer.js.map