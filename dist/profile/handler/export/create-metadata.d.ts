import { DbService } from '../../../db';
import { Response } from '../../../api';
import { DeviceInfo } from '../../../util/device';
import { FileService } from '../../../util/file/def/file-service';
import { ExportProfileContext } from '../../def/export-profile-context';
export declare class CreateMetaData {
    private dbService;
    private fileService;
    private deviceInfo;
    constructor(dbService: DbService, fileService: FileService, deviceInfo: DeviceInfo);
    execute(exportContext: ExportProfileContext): Promise<Response>;
    private generateMetaData;
    private populateMetaData;
}
