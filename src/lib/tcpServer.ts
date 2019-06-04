import * as  net from 'net';
import * as crypto from 'crypto';
import * as EventEmitter from 'events';
const DEBUG = require('debug'),
    debug = DEBUG('tcpserver:debug'),
    logError = DEBUG('tcpserver:error');
export default class extends EventEmitter {

    private server: net.Server;
    private port: number;
    private clientList: any;
    private onData: Function;
    constructor(_port: number, _onData: Function) {
        super();
        this.clientList = {};
        this.port = _port;
        this.onData = _onData;
    }

    start() {
        let me = this;
        this.server = net.createServer();
        this.server.on('connection', (client: net.Socket) => {
            this._onConnection(client);
        });
        this.server.on('error', this.onError);
        this.server.listen(this.port, () => { // 'listening' 监听器
            let address = me.server.address();
            this.emit('onstart', { address: address });
            debug('服务器已启动:', address);
        });
    }

    _onConnection(client: any) {
        let me = this;

        client.name = client.remoteAddress + ':' + client.remotePort; //crypto.createHash('sha1').update(client.remoteAddress + ':' + client.remotePort + Math.random()).digest('hex');//
        client.maps = {};
        client.maps.buffers = [];
        client.maps.total = 0;
        //client.noDelay = true;
        me.clientList[client.name] = client;
        client.on('data', (data: Buffer) => {

            //if (data.length < (4 + 4)) {
            //   logError(`${client.name} 协议异常 buffer length:${data.length}`);
            // client.write('协议异常 data length:\n\r');
            //  return;
            //}

            if (client.maps.total == 0) {
                client.maps.total = data.readUInt32LE(0);
                //  debug('%s read header.%d',client.name,client.maps.total);
            }

            client.maps.buffers.push(data);

            let buff = Buffer.concat(client.maps.buffers);
            // debug('接收总字节数：%d',total);
            let buffLen = buff.length;
            //  debug('pid:%s - %s发送：%d，当前接收字节数：%d,完成:%s%', process.pid, client.name, client.maps.total, buffLen, Math.round(buffLen / client.maps.total * 10000) / 100.00);

            if (buffLen == client.maps.total) {

                client.maps = {};
                client.maps.buffers = [];
                client.maps.total = 0;
                // debug('%s触发data事件。', client.name);
                //me.emit('ondata', client, buff);
                this.onData(client, buff);
            }

            else if (buffLen > client.maps.total) {
                logError('数据包异常，断开连接。');
                client.end();
                delete this.clientList[client.name];
                //debug('当前连接数：%d', Object.keys(clientList).length);
            }
        });


        client.on('close', () => {
            debug('client is closed. ');
            me.emit('client_close');
        });

        client.on('error', (error: Error) => {
            if (error) {
                logError('client error', error.stack);
            } else {
                logError('%s出现异常错误，断开连接。', client.name);
            }

            logError('%s出现异常，断开连接。', client.name);
            client.end();
            //clientList.splice(clientList.indexOf(client), 1);//remove client
            delete me.clientList[client.name];
            debug('当前连接数：%d', Object.keys(me.clientList).length);
            // me.emit('client_error');
        });

        client.on('end', () => {
            debug('服务器已断开,删除客户端:%s', client.name);
            delete me.clientList[client.name];
            debug('当前连接数：%d', Object.keys(me.clientList).length);
            //  me.emit('client_end');
        });


    }
    onError(e: any) {
        if (e.code == 'EADDRINUSE') {
            logError('地址被占用.');
        }
        console.error(e.stack);
    }


}

