import {ImportContentContext} from '../../index';
import {Response} from '../../../../native/http';
import {ContentErrorCode} from '../../util/content-constants';
import {FileService} from '../../../../native/file/def/file-service';
import {ZipService} from '../../../../native/util/zip/def/zip-service';
import {UniqueId} from '../../../../native/db/util/unique-id';

export class ExtractEcar {
    private readonly FILE_SIZE = 'FILE_SIZE';

    constructor(private fileService: FileService,
                private zipService: ZipService) {
    }

    public execute(importContext: ImportContentContext): Promise<Response> {
        const response: Response = new Response();
        let size: number;
        return this.fileService.getMetaData(importContext.ecarFilePath).then((metaData) => {
            size = metaData.size;
            return this.fileService.createDir(importContext.tmpLocation!.concat(UniqueId.generateUniqueId()), true);
        }).then(async (directoryEntry) => {
            importContext.tmpLocation = directoryEntry.nativeURL;
            await new Promise((resolve) => {
                this.zipService.unzip(importContext.ecarFilePath, {target: directoryEntry.nativeURL}, () => {
                    resolve();
                });
            });
            importContext.metadata = {};
            importContext.metadata.FILE_SIZE = size;
            response.body = importContext;
            return Promise.resolve(response);
        }).catch(error => {
            response.errorMesg = ContentErrorCode.IMPORT_FAILED_EXTRACT_ECAR.valueOf();
            return Promise.reject(response);
        });
    }
}
