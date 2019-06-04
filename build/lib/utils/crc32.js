"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crc32 = require('buffer-crc32');
class CRC {
    static crc32Buffer(buff) {
        return crc32(buff).toString('hex').toUpperCase();
    }
}
exports.default = CRC;
//# sourceMappingURL=crc32.js.map