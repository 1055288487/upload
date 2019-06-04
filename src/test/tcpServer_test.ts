
const net = require('net');

const client = net.createConnection({ port: 30001 }, () => {
    //'connect' listener
    console.log('connected to server!');

    let content = JSON.stringify({
        "md5": "E96261B90BE7B1895E9193D9CB9AAC5A",
        "crc": "F9C19B6F",
        "cmd": "1",
        "fileName": "0483737.xls",
        "offset": 0,
        "user":
        {
            "sender": "serverid-gyj", "receiver": "serverid-joe"
        },
        "fileLength": 83456,
        "client":
        {
            "name": "realicq",
            "version": "6.5"
        },
        "complete": 1
    });
    let contentLen = Buffer.byteLength(content);
    let total = 4 + 4 + contentLen;
    let buff = Buffer.alloc(4 + 4 + contentLen);
    let index = 0;
    buff.writeInt32LE(total, index);
    index += 4;
    buff.writeInt32LE(contentLen, index);
    index += 4;
    buff.write(content, index);
    client.write(buff);

});
client.on('data', (data: any) => {
    console.log(data.toString());
    //client.end();
});
client.on('end', () => {
    console.log('disconnected from server');
});