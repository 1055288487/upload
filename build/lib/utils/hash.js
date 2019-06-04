"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const crypto = require("crypto");
class Hash {
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
exports.default = Hash;
//# sourceMappingURL=hash.js.map