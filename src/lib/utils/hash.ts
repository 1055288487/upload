import * as fs from 'fs';
import * as crypto from 'crypto';

class Hash {

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

export default Hash;