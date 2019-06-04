const fs = require('fs'),
    crypto = require('crypto'),
    mkdirp = require('mkdirp'),
    { promisify } = require('util'),
    DEBUG = require('debug'),
    debug = DEBUG('fs:debug'),
    logError = DEBUG('fs:error');


const writeFileAsync = promisify(fs.writeFile),
    readFileAsync = promisify(fs.readFile),
    renameAsync = promisify(fs.rename),
    existsAsync = promisify(fs.exists),
    deleteAsync = promisify(fs.unlink),
    mkdirpAsync = promisify(mkdirp);

export default class {


    /**
     * 创建文件夹，支持逐级创建,创建成功返回 true,失败返回 false
     * @param path 文件夹路径
     */
    public static mkdir(path: string): Promise<boolean> {
        return this.exists(path).then((e: boolean) => {
            //debug('mkdir exists:%s - %s', path, e);
            if (e) return true;

            return mkdirpAsync(path).then((p: string) => {
                debug('mkdir %s success.', p);
                return true;
            }).catch((err: Error) => {
                logError('mkdir Error:%s', err);
                return false;
            });


        });

    }

    /**
     * 读取文件
     * @param path 
     */
    public static readFile<T>(path: string, encoding: string = 'utf8'): Promise<T> {
        return readFileAsync(path, { encoding: encoding, flag: 'r' }).then((data: T) => {
            return data;
        }).catch((err: Error) => {
            logError('readFile Error:%s', err);
            return null;
        });
    }

    /**
     *  删除文件
     * @param path 文件路径
     */
    public static delete(path: string): Promise<boolean> {
        return deleteAsync(path).then(() => true).catch((err: Error) => {
            logError('delete Error:%s', err);
            return false;
        });
    }

    /**
     * 判断文件或者文件夹是否存在
     * @param path 
     */
    public static exists(path: string): Promise<boolean> {
        return existsAsync(path);
    }

    /**
     * 重命名文件
     * @param sourcePath 原文件路径
     * @param dest 目标文件路径
     */
    public static rename(sourcePath: string, dest: string): Promise<boolean> {

        return renameAsync(sourcePath, dest).then(() => true).catch((err: Error) => {
            logError('rename error:%s', err);
            return false;
        });


    }

    /**
     * 写文件，不存在则创建，存在则更新
     * @param filePath 文件路径
     * @param data 文件内容
     */
    public static writeFile(filePath: string, data: string | Buffer): Promise<boolean> {
        return writeFileAsync(filePath, data).then(() => true).catch((err: Error) => {
            logError('writeFile Error:%s', err);
            return false;
        });
    }

    /**
     * 以流的方式写文件
     * @param filePath 
     * @param buffer 
     * @param offset 
     * @param onFinish 
     * @param onClose 
     * @param onError 
     */
    public static wirte(filePath: string, buffer: Buffer, offset: number, onFinish: Function, onClose?: (fd: number) => void, onError?: Function) {
        let flag = offset == 0 ? 'w' : 'r+';
        let stream = fs.createWriteStream(filePath, {
            flags: flag,
            autoClose: true,
            start: offset
        });

        if (onClose)
            stream.on('close', onClose);


        stream.on('error', (err: Error) => {
            stream.end();
            logError('stream ERROR:', err);
            if (onError)
                onError(err)
        });

        if (onFinish)
            stream.on('finish', onFinish);

        stream.write(buffer);
        stream.end();

    }

    /**
     * 取MD5前5位生成路径 如：E96261B90BE7B1895E9193D9CB9AAC5A -> /E/9/6/2/6/
     * @param md5 32位md5
     */
    public static md5toPath(md5: string): string {
        if (md5.length < 5) return '';
        let p = [],
            path = '';
        for (let i = 0; i < 5; i++)
            p.push(md5[i]);

        path = path + p.join('/');
        return '/' + path + '/';
    }

    public static md5(filePath: string | Buffer): Promise<string> {

        return new Promise<string>((resolve: (value: string) => void, reject: (error: Error) => void) => {

            let rs = fs.createReadStream(filePath),
                hash = crypto.createHash('md5');

            rs.on('readable', () => {
                var data = rs.read();
                if (data)
                    hash.update(data);
                else
                    resolve(hash.digest('hex'));
            });

            rs.on('error', reject);
        });

    }

}