import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Entry} from '../../../util/file';
import {ContentEntry} from '../../db/schema';
import {ContentUtil} from '../../util/content-util';
import {Response} from '../../../api';
import {ContentErrorCode} from '../../util/content-constants';
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CopyAsset {
    constructor(private fileService: FileService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        try {
            let i = 0;
            for (const element of exportContentContext.contentModelsToExport) {
                const contentInDb = element as ContentEntry.SchemaMap;
                const contentData = exportContentContext.items![i];
                const appIcon = contentData['appIcon'];
                if (appIcon) {
                    await this.copyAsset(contentInDb[COLUMN_NAME_PATH]!, exportContentContext.tmpLocationPath!, appIcon);
                }

                const contentDisposition: string = contentData['contentDisposition'];
                const contentEncoding: string = contentData['contentEncoding'];
                if (ContentUtil.isInlineIdentity(contentDisposition, contentEncoding)) {
                    const artifactUrl: string = contentData['artifactUrl'];
                    if (artifactUrl) {
                        await this.copyAsset(contentInDb[COLUMN_NAME_PATH]!, exportContentContext.tmpLocationPath!, artifactUrl);
                    }
                }
                i++;
            }
            response.body = exportContentContext;
            return response;
        } catch (e) {
            response.errorMesg = ContentErrorCode.EXPORT_FAILED_COPY_ASSET;
            throw response;
        }

    }

    private async copyAsset(sourcePath: string, destinationPath: string, fileName: string): Promise<Entry> {
        return this.fileService.exists(sourcePath.concat(fileName)).then((entry: Entry) => {
                return this.fileService.createDir(destinationPath, true);
        }).then(() => {
            return this.fileService.copyFile(sourcePath, fileName, destinationPath, fileName);
        });
    }
}
