import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {DirectoryEntry, Entry} from '../../../util/file';
import {__await} from 'tslib';
import {ContentEntry} from '../../db/schema';
import COLUMN_NAME_CONTENT_TYPE = ContentEntry.COLUMN_NAME_CONTENT_TYPE;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;
import {ContentUtil} from '../../util/content-util';
import {Response} from '../../../api';
import {ErrorCode} from '../../util/content-constants';
import {FileUtil} from '../../../util/file/util/file-util';
import * as ts from 'tsickle/src/typescript-2.4';
import directory = ts.ScriptElementKind.directory;

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
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
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
