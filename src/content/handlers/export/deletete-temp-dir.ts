import {Response} from '../../../api';
import {ExportContentContext} from '../..';

export class DeleteTempDir {

    constructor() {
    }

    public async execute(exportContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return new Promise<Response>((resolve, reject) => {
            const tmpDirPath = exportContext.destinationFolder!.concat('tmp/');
            sbutility.rm(tmpDirPath, '', () => {
                response.body = exportContext;
                resolve(response);
            }, (e) => {
                response.body = exportContext;
                resolve(response);
            });
        });
    }
}
