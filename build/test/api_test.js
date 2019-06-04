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
const api_1 = require("../lib/api");
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        let file = {
            md5: "000000000051c8d433eddf9a879f0000",
            fileName: "test",
            user: {
                "sender": '',
                "receiver": ''
            },
            length: 9711468,
            path: "/storage/0/0/0/0/0/000000000051c8d433eddf9a879f0000.dat",
            createDate: 1024,
            hitTimes: 0,
            lastHitDate: 1499407172473.0
        };
        console.time('createfile');
        let result = yield api_1.default.createFile(file);
        console.log('createfile result:', result);
        console.timeEnd('createfile');
        console.time('getfile');
        let value = yield api_1.default.fetchFile(file.md5);
        if (value)
            console.log('getfile result:', value.data);
        console.timeEnd('getfile');
        file.hitTimes = 100;
        console.time('updatefile');
        result = yield api_1.default.updateFile(file.md5, file);
        console.log('updatefile result:', result);
        console.timeEnd('updatefile');
    });
}());
//# sourceMappingURL=api_test.js.map