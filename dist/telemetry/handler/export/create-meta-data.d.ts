import { DbService } from '../../../db';
import { Response } from '../../../api';
import { DeviceInfo } from '../../../util/device/def/device-info';
import { FileService } from '../../../util/file/def/file-service';
import { ExportTelemetryContext } from '../..';
export declare class CreateMetaData {
    private dbService;
    private fileService;
    private deviceInfo;
    constructor(dbService: DbService, fileService: FileService, deviceInfo: DeviceInfo);
    execute(exportContext: ExportTelemetryContext): Promise<Response>;
    private generateMetaData;
    private populateMetaData;
}
