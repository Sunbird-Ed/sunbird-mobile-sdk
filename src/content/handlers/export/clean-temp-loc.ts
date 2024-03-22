import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import {FileExtension} from '../../util/content-constants';
import {Entry, Metadata} from '../../../util/file';
import {ExportContentContext} from '../..';

export class CleanTempLoc {

    constructor(private fileService: FileService) {
    }

    public async execute(exportContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        const yesterday: number = Date.now() - (24 * 60 * 60 * 1000);
        const directoryList: Entry[] = await this.fileService.listDir(exportContext.destinationFolder);
        if (directoryList && directoryList.length > 0) {
            for (const directory of directoryList) {
                if (FileUtil.getFileExtension(directory.nativeURL) === FileExtension.CONTENT) {
                    const metaData: Metadata = await this.fileService.getMetaData(directory.nativeURL);
                    if (new Date(metaData.modificationTime).getMilliseconds() <= yesterday) {
                        await new Promise<void>((resolve) => {
                            directory.remove(() => {
                                resolve();
                            }, () => {
                                resolve();
                            });
                        });
                    }
                }
            }
        }
        response.body = exportContext;
        return Promise.resolve(response);
    }
}
