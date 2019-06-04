import api from './api';
import { IProgress, IFile } from './types';

class Service {

    public async findFile(md5: string): Promise<IFile | null> {
        let result = await api.fetchFile(md5);
        if (!result || !result.success) return null;
        return result.data;
    }

    public async create(doc: IFile) {
        let result = await api.createFile(doc);
        if (!result || !result.success) return null;
        return result.data;
    }

    public async updateFile(md5: string, doc: IFile) {
        await api.updateFile(md5, doc);
    }

    public async findProgress(md5: string): Promise<IProgress | null> {
        let result = await api.fetchProgress(md5)
        if (!result || !result.success)
            return null;
        return result.data;

    }

  

    public async deleteProgress(md5: string) {
        await api.deleteProgress(md5);
    }

    public async saveProgress(doc: IProgress) {
        await api.saveProgress(doc);
    }

}

export default new Service();