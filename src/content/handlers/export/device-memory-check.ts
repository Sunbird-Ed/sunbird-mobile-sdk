import {FileService} from '../../../util/file/def/file-service';
import {ExportContentContext} from '../..';
import {Response} from '../../../api';

export class DeviceMemoryCheck {
    constructor(private fileService: FileService) {
    }

    public async execute(exportContentContext: ExportContentContext): Promise<Response> {
        const response: Response = new Response();
        return this.fileService.getFreeDiskSpace()
            .then((freeSpace) => {
                const fileSize: number = this.getFileSize(exportContentContext.items!);
                // if (!FileUtil.isFreeSpaceAvailable(freeSpace, fileSize, 0)) {
                //     throw response;
                // }
                response.body = exportContentContext;
                return response;
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
