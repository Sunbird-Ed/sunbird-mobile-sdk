import { Response } from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';

export class CopyToDestination {

    constructor() {
    }

    public async execute(exportResponse: Response, destinationFolder): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            buildconfigreader.copyFile(FileUtil.getDirecory(exportResponse.body.ecarFilePath), destinationFolder,
                FileUtil.getFileName(exportResponse.body.ecarFilePath),
                () => {
                    resolve(exportResponse);
                }, err => {
                    console.error(err);
                    resolve(err);
                });
        });
    }
}
