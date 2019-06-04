"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs');
const { promisify } = require('util');
const exists = promisify(fs.exists), rename = promisify(fs.rename);
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let existsResult = yield exists(__filename);
            console.log('exists:', existsResult);
            yield rename(__dirname + '/crc_test.js', __dirname + '/crc.js');
            console.log('rename success.');
        }
        catch (err) {
            console.error('rname exception:\n%s', err);
        }
        ;
    });
}());
//# sourceMappingURL=promisify_test.js.map