import {ZipService} from '../../../../native/util/zip/def/zip-service';
import {ExportContentContext} from '../../index';
import {Response} from '../../../../native/http';
import {ContentEntry} from '../../db/schema';
import {ContentUtil} from '../../util/content-util';
import {FileService} from '../../../../native/file/def/file-service';
import COLUMN_NAME_LOCAL_DATA = ContentEntry.COLUMN_NAME_LOCAL_DATA;
import COLUMN_NAME_CONTENT_STATE = ContentEntry.COLUMN_NAME_CONTENT_STATE;
import COLUMN_NAME_IDENTIFIER = ContentEntry.COLUMN_NAME_IDENTIFIER;
import COLUMN_NAME_PATH = ContentEntry.COLUMN_NAME_PATH;

export class CompressContent {
    constructor(private zipService: ZipService,
                private fileService: FileService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        for (const element of exportContentContext.contentModelsToExport) {
            const contentInDb = element as ContentEntry.SchemaMap;
            const contentData = JSON.parse(contentInDb[COLUMN_NAME_LOCAL_DATA]);
            if (!ContentUtil.isAvailableLocally(contentInDb[COLUMN_NAME_CONTENT_STATE]!)
                || ContentUtil.isOnlineContent(contentData)
                || ContentUtil.isInlineIdentity(contentData['contentDisposition'], contentData['contentEncoding'])) {
                continue;
            }
            const artifactUrl = contentData.artifactUrl;
            if (artifactUrl) {
                const payload = exportContentContext.tmpLocationPath!.concat(artifactUrl);
                const path = contentInDb[COLUMN_NAME_PATH];
                const skipDirectoriesName: string[] = [];
                const skipFilesName: string[] = [];
                skipDirectoriesName.push(contentInDb[COLUMN_NAME_IDENTIFIER]);
                skipFilesName.push(contentInDb[COLUMN_NAME_IDENTIFIER].concat('/', 'manifest.json'));
                const dirs = artifactUrl.split('/');
                // await this.fileService.createDir(exportContentContext.tmpLocationPath!.concat(dirs[0]), true);
                // await this.fileService.createFile(exportContentContext.tmpLocationPath!, dirs[1], true);
                await new Promise((resolve, reject) => {
                    this.zipService.zip(path!, {target: payload!}, skipDirectoriesName, skipFilesName, () => {
                        resolve();
                    }, () => {
                        reject();
                    });
                });
            }

        }
        response.body = exportContentContext;
        return Promise.resolve(response);
    }

}
