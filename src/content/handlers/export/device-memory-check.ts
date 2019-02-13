import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {FileUtil} from '../../../util/file/util/file-util';
import {Response} from '../../../api';

export class DeviceMemoryCheck {
    constructor(private fileService: FileService) {
    }

    execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.getFreeDiskSpace().then((freeSpace) => {
            const fileSize: number = this.getFileSize(exportContentContext.items);
            if (!FileUtil.isFreeSpaceAvailable(freeSpace, fileSize, 0)) {
                return Promise.reject(response);
            }
            response.body = exportContentContext;
            return Promise.resolve(response);
        });
    }

    private getFileSize(items: any[]): number {
        let fileSize = 0;
        if (items) {
            items.forEach((item) => {
                if (item.size) {
                    fileSize = fileSize + Number(item.size);
                }
            });
        }
        return fileSize;
    }
}
