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
const debug = require('debug')('pid');
const fs_1 = require("./fs");
class default_1 {
    static save(path) {
        return __awaiter(this, void 0, void 0, function* () {
            path = path;
            let pid = process.pid.toString();
            let ret = yield fs_1.default.writeFile(path, pid);
            debug('%s save to:%s,result: %s', pid, path, ret ? 'success' : 'error');
        });
    }
}
exports.default = default_1;
//# sourceMappingURL=pid.js.map