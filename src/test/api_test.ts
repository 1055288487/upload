import api from '../lib/api';
import { IProgress, IFile, IResult } from '../lib/types';
(async function () {


    // console.time('ts');
    // let result = await api.fetchDownloadHost('3106fd5d1e9da0d3306b69b4d006e5f1');
    // console.timeEnd('ts');
    // console.log('ret:', result);

    let file: any = {
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
    let result = await api.createFile(file);
    console.log('createfile result:', result);
    console.timeEnd('createfile');

    console.time('getfile');
    let value: IResult<IFile> | null = await api.fetchFile(file.md5);
    if (value)
        console.log('getfile result:', value.data);
    console.timeEnd('getfile');

    file.hitTimes = 100;

    console.time('updatefile');
    result = await api.updateFile(file.md5, file);
    console.log('updatefile result:', result);
    console.timeEnd('updatefile');



}());