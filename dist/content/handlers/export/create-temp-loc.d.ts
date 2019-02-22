import { FileService } from '../../../util/file/def/file-service';
import { ExportContentContext } from '../..';
export declare class CreateTempLoc {
    private fileService;
    constructor(fileService: FileService);
    execute(exportContext: ExportContentContext): Promise<Response>;
}
