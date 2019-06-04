import utils from '../lib/utils';

for (let i = 0; i < 9999; i++) {
    let testContent = i+'0';

    let buff = Buffer.alloc(Buffer.byteLength(testContent));
    buff.write(testContent);

    console.log('crc:', utils.crc32.crc32Buffer(buff));

    // let temp = '', result = '';
    // for (let i = 0; i < buff.length; i++) {
    //     temp = buff[i].toString(16);
    //     if (temp.length < 2) {
    //         console.log('补0');
    //         temp = '0' + temp;
    //     }
    //     result += temp;

    // }
    // if (result != buff.toString('hex'))
    //     console.log('不一致:', testContent);
    // else
    //     console.log('%s - ok.',testContent);



}