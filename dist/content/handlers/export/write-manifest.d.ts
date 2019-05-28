import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
import { ExportContentContext } from '../..';
import { DeviceInfo } from '../../../util/device';
export declare class WriteManifest {
    private fileService;
    private deviceInfo;
    private static readonly MANIFEST_FILE_NAME;
    constructor(fileService: FileService, deviceInfo: DeviceInfo);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
