// import MongoDB from '../lib/provider';

// (async function () {
//     const mongo = new MongoDB('files');
//     let oneDoc = await mongo.findOne({ 'md5': '15' });
//     console.log('findOne:', oneDoc);
// }());


import { EventEmitter } from 'events';

class Test extends EventEmitter {

    private name: string;

    constructor(_name: string) {
        super();
        this.name = _name;
    }
    doit() {
        this.emit('doing', { name: this.name });
    }

}

const test = new Test('joe');
test.on('doing', (e: any) => {
    console.log('do event', e);
});
test.doit();