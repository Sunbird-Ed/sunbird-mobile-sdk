import { FileService } from '../../../util/file/def/file-service';
import { ExportTelemetryContext } from '../..';
import { DeviceInfo } from '../../../util/device/def/device-info';
import { Response } from '../../../api';
export declare class CreateTelemetryExportFile {
    private fileService;
    private deviceInfo;
    constructor(fileService: FileService, deviceInfo: DeviceInfo);
    execute(exportContext: ExportTelemetryContext): Promise<Response>;
    private getExportedFileName;
}
