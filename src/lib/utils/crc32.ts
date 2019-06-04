//import * as crc32 from 'buffer-crc32';
const crc32 = require('buffer-crc32');

class CRC {

    public static crc32Buffer(buff: Buffer): string {
        // let r = crc32(buff),
        //     result = '',
        //     temp;
        // for (let i = 0; i < r.length; i++) {
        //     temp = r[i].toString(16);
        //     if (temp.length < 2)
        //         temp = '0' + temp;
        //     result += temp;
        // }

        //return result.toUpperCase();
        return crc32(buff).toString('hex').toUpperCase();
    }
}

export default CRC;