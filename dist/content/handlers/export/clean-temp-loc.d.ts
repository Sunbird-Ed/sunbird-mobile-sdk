import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
import { ExportContentContext } from '../..';
export declare class CleanTempLoc {
    private fileService;
    constructor(fileService: FileService);
    execute(exportContext: ExportContentContext): Promise<Response>;
}
