import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
import { ExportContentContext } from '../..';
import { DeviceInfo } from '../../../util/device';
export declare class WriteManifest {
    private fileService;
    private deviceInfo;
    constructor(fileService: FileService, deviceInfo: DeviceInfo);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
