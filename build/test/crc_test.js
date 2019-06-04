"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../lib/utils");
for (let i = 0; i < 9999; i++) {
    let testContent = i + '0';
    let buff = Buffer.alloc(Buffer.byteLength(testContent));
    buff.write(testContent);
    console.log('crc:', utils_1.default.crc32.crc32Buffer(buff));
}
//# sourceMappingURL=crc_test.js.map