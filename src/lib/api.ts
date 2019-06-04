import rq from './utils/rq';
import { IProgress, IFile, IResult } from './types';
const DEBUG = require('debug'),
    debug = DEBUG('api:debug'),
    logError = DEBUG('api:error');


export default class {


    public static async fetchDownloadHost(md5: string): Promise<string> {

        let result = await rq.get(`/api/download/${md5}`);
        if (result.status !== 200) {
            logError('fetchDownloadHost md5:%s http status code:%d / %s', md5, result.status, result.statusText);
            return '';
        }
        return result.data.url;
    }

    public static async fetchFile(md5: string): Promise<IResult<IFile> | null> {
        let result = await rq.get(`/api/file/${md5}`);
        if (result.status !== 200) {
            logError('fetchFile md5:%s http status code:%d / %s', md5, result.status, result.statusText);
            return null;
        }
        return result.data;
    }

    public static async createFile(file: IFile): Promise<IResult<any> | null> {
        let result = await rq.post('/api/file', file);
        if (result.status !== 200) {
            logError('createFile:%j,http status code:%d / %s', file, result.status, result.statusText);
            return null;
        }
        return result.data;
    }

    public static async updateFile(md5: string, file: IFile): Promise<IResult<any> | null> {
        let result = await rq.put(`/api/file/${md5}`, file);
        if (result.status !== 200) {
            logError('updateFile md5:%s http status code:%d / %s', md5, result.status, result.statusText);
            return null;
        }
        return result.data;
    }

    public static async fetchProgress(md5: string): Promise<IResult<IProgress> | null> {
        let result = await rq.get(`/api/progress/${md5}`);
        if (result.status !== 200) {
            logError('fetchProgress md5:%s http status code:%d / %s', md5, result.status, result.statusText);
            return null;
        }
        return result.data;
    }


    /**
     * 创建或更新
     * @param value 
     */
    public static async saveProgress(value: IProgress): Promise<IResult<any> | null> {
        let result = await rq.post('/api/progress', value);
        if (result.status !== 200) {
            logError('createProgress:%j,http status code:%d / %s', value, result.status, result.statusText);
            return null;
        }
        return result.data;
    }


    public static async deleteProgress(md5: string): Promise<IResult<any> | null> {
        let result = await rq.delete(`/api/progress/${md5}`);
        if (result.status !== 200) {
            logError('deleteProgress md5:%s http status code:%d / %s', md5, result.status, result.statusText);
            return null;
        }
        return result.data;
    }


}
