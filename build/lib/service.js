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
const api_1 = require("./api");
class Service {
    findFile(md5) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield api_1.default.fetchFile(md5);
            if (!result || !result.success)
                return null;
            return result.data;
        });
    }
    create(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield api_1.default.createFile(doc);
            if (!result || !result.success)
                return null;
            return result.data;
        });
    }
    updateFile(md5, doc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield api_1.default.updateFile(md5, doc);
        });
    }
    findProgress(md5) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield api_1.default.fetchProgress(md5);
            if (!result || !result.success)
                return null;
            return result.data;
        });
    }
    deleteProgress(md5) {
        return __awaiter(this, void 0, void 0, function* () {
            yield api_1.default.deleteProgress(md5);
        });
    }
    saveProgress(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            yield api_1.default.saveProgress(doc);
        });
    }
}
exports.default = new Service();
//# sourceMappingURL=service.js.map