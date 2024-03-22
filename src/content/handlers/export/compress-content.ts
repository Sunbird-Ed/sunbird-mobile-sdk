import {ZipService} from '../../../util/zip/def/zip-service';
import {ExportContentContext, FileName} from '../..';
import {Response} from '../../../api';
import {ContentEntry} from '../../db/schema';
import {ContentUtil} from '../../util/content-util';

export class CompressContent {
    constructor(private zipService: ZipService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        for (const element of exportContentContext.contentModelsToExport) {
            const contentInDb = element as ContentEntry.SchemaMap;
            const contentData = JSON.parse(contentInDb[ContentEntry.COLUMN_NAME_LOCAL_DATA]);

            if (!ContentUtil.isAvailableLocally(contentInDb[ContentEntry.COLUMN_NAME_CONTENT_STATE]!)
                || ContentUtil.isOnlineContent(contentData)
                || ContentUtil.isInlineIdentity(contentData['contentDisposition'], contentData['contentEncoding'])) {
                continue;
            }

            const artifactUrl = contentData.artifactUrl;
            if (artifactUrl) {
                const payload = exportContentContext.tmpLocationPath!.concat(artifactUrl);
                const path = contentInDb[ContentEntry.COLUMN_NAME_PATH];
                const skipDirectoriesName: string[] = [];
                const skipFilesName: string[] = [];
                skipDirectoriesName.push(contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER]);
                skipFilesName.push(contentInDb[ContentEntry.COLUMN_NAME_IDENTIFIER].concat('/', FileName.MANIFEST.valueOf()));
                await new Promise<void>((resolve, reject) => {
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
