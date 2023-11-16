import { Response } from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import { ContentExportRequest } from '../..';

export class CopyToDestination {

    constructor() {
    }

    public async execute(exportResponse: Response, contentExportRequest: ContentExportRequest): Promise<Response> {
        return new Promise<Response>(async (resolve, reject) => {
            let destinationFolder;
            let devicePlatform = "";
            await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
                devicePlatform = val.platform
            })
            if (contentExportRequest.saveLocally) {
                destinationFolder = contentExportRequest.destinationFolder;
            } else {
                destinationFolder = (devicePlatform.toLowerCase() === "ios") ? window['Capacitor']['Plugins'].Directory.Documents : window['Capacitor']['Plugins'].Directory.Cache;
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
