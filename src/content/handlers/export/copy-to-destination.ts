import { Response } from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import { ContentExportRequest } from '../..';

export class CopyToDestination {

    constructor() {
    }

    public async execute(exportResponse: Response, contentExportRequest: ContentExportRequest): Promise<Response> {
        return new Promise<Response>((resolve, reject) => {
            let destinationFolder;
            if (contentExportRequest.saveLocally) {
                destinationFolder = contentExportRequest.destinationFolder;
            } else {
                destinationFolder = (window.device.platform.toLowerCase() === "ios") ? cordova.file.documentsDirectory : cordova.file.externalCacheDirectory;;
            }
            sbutility.copyFile(FileUtil.getDirecory(exportResponse.body.ecarFilePath), destinationFolder,
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
