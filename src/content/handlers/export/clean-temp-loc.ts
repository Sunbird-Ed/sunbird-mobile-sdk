import {FileService} from '../../../util/file/def/file-service';
import {Response} from '../../../api';
import {FileUtil} from '../../../util/file/util/file-util';
import {ErrorCode, FileExtension, Visibility} from '../../util/content-constants';
import {Entry, Metadata} from '../../../util/file';
import {ExportContentContext} from '../..';

export class CleanTempLoc {

    constructor(private fileService: FileService) {
    }

    public execute(exportContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        const yesterday: number = Date.now() - (24 * 60 * 60 * 1000);
        return this.fileService.listDir(exportContext.destinationFolder).then((directoryList) => {
            if (directoryList && directoryList.length > 0) {
                directoryList.forEach(async (directory) => {
                    if (FileUtil.getFileExtension(directory.toURL()) === FileExtension.CONTENT) {
                        const metaData: Metadata = await this.fileService.getMetaData(directory.toURL());
                        if (new Date(metaData.modificationTime).getMilliseconds() <= yesterday) {
                            directory.remove(() => {
                            }, () => {
                            });
                        }
                    }
                });
            }
            return Promise.resolve(response);
        }).catch(() => {
            response.errorMesg = ErrorCode.EXPORT_FAILED_COPY_ASSET;
            return Promise.reject(response);
        });
    }
}
