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
const utils_1 = require("./lib/utils");
const app_1 = require("./lib/app");
const config = require('../config.json');
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        yield utils_1.default.pid.save('./app.pid');
        const app = new app_1.default();
        app.start();
    });
}());
//# sourceMappingURL=index.js.map