"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
class Test extends events_1.EventEmitter {
    constructor(_name) {
        super();
        this.name = _name;
    }
    doit() {
        this.emit('doing', { name: this.name });
    }
}
const test = new Test('joe');
test.on('doing', (e) => {
    console.log('do event', e);
});
test.doit();
//# sourceMappingURL=mongodb_test.js.map