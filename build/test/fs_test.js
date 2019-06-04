"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../lib/utils");
const fs = utils_1.default.fs;
const debug = require('debug')('fs-test');
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        const path = __dirname + '/test.txt';
        let ext = yield fs.exists(__filename);
        debug('exists result:', ext);
        let wf = yield fs.writeFile(path, 'hello_' + Date.now());
        debug('writeFile result:', wf);
        let readRet = yield fs.readFile(path);
        debug('read result:', readRet);
        let md5Ret = yield fs.md5(path);
        debug('md5 result:', md5Ret);
        let deleteRet = yield fs.delete(path);
        debug('deleteRet:', deleteRet);
        let mkdirRet = yield fs.mkdir(__dirname + fs.md5toPath(md5Ret));
        debug('mkdir result:', mkdirRet);
    });
}());
//# sourceMappingURL=fs_test.js.map