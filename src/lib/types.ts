

export interface IProtocol {

    // constructor() {
    //     this.md5;
    //     this.crc;
    //     this.cmd;
    //     this.fileName;
    //     this.offset;
    //     this.user;
    //     this.fileLength;
    //     this.client;
    //     this.complete;
    // }

    md5: string;

    crc: string;

    cmd: number;

    fileName: string;

    offset: number;

    user: { sender: string, receiver: string };

    fileLength: number;

    client: {
        name: string,
        version: number
    };

    complete: number;
    //  [key: string]: any

    //  "md5":"E96261B90BE7B1895E9193D9CB9AAC5A",
    //     "crc":"F9C19B6F",
    //     "cmd":"1",
    //     "fileName":"0483737.xls",
    //     "offset":0,
    //     "user":
    //     {
    //      "sender":"serverid-gyj","receiver":"serverid-joe"
    //     },
    //     "fileLength":83456,
    //     "client":
    //     {
    //         "name":"realicq",
    //         "version":"6.5"    
    //     },
    //     "complete":1
}

export interface IReply {
    success: boolean;
    code: number;
    message: string;
    accept?: number;
}

export interface IPackage {
    protocol: IProtocol;
    buffer: Buffer;
    bufferLength: number;
}


export interface IFile {

    md5: string;
    fileName: string;
    user: { sender: string, receiver: string };
    client: { name: string, version: number };
    length: number;
    path: string;
    createDate: number;
    hitTimes: number;
    lastHitDate: number;
}

export interface IProgress {
    md5: string;
    length: number;
    offset: number;
    createDate: number;
}

export interface IResult<T> {
    ret: number;
    success: boolean;
    msg: string;
    data: T;
}