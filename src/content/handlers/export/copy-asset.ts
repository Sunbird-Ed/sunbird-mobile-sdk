import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Entry} from '../../../util/file';
import {__await} from 'tslib';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_CONTENT_TYPE = ContentEntry.COLUMN_NAME_CONTENT_TYPE;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import {ContentUtil} from '../../util/content-util';
import {Response} from '../../../api';
import {ErrorCode} from '../../util/content-constants';

export class CopyAsset {
    constructor(private fileService: FileService) {
    }
    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        try {
            let i = 0;
            exportContentContext.contentModelsToExport.forEach(async (contentInDb) => {
                const contentData = exportContentContext.items![i];
                const appIcon = contentData.appIcon;
                if (appIcon) {
                    await this.copyAsset(contentInDb[COLUMN_NAME_PATH]!, exportContentContext.tmpLocationPath!, appIcon);
                }

                const contentDisposition: string = contentData.contentDisposition;
                const contentEncoding: string = contentData.contentEncoding;
                if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
                    const artifactUrl: string = contentData.artifactUrl;
                    if (artifactUrl) {
                        await this.copyAsset(contentInDb[COLUMN_NAME_PATH]!, exportContentContext.tmpLocationPath!, artifactUrl);
                    }
                }
                i++;
            });
            response.body = exportContentContext;
            return Promise.resolve(response);
        } catch (e) {
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
            return Promise.reject(response);
        }

    }

    private copyAsset(sourcePath: string, destinationPath: string, fileName: string): Promise<Entry> {
        return this.fileService.exists(sourcePath.concat('/', fileName)).then(() => {
            return this.fileService.createDir(destinationPath.concat('/', fileName), true);
        }).then(() => {
            return this.fileService.copyDir(sourcePath, fileName, destinationPath, fileName);
        });
    }
}
