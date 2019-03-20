import { Response } from '../../../api';
import { FileService } from '../../../util/file/def/file-service';
import { ExportProfileContext } from '../../def/export-profile-context';
export declare class GetEparFilePath {
    private fileService;
    constructor(fileService: FileService);
    execute(exportContext: ExportProfileContext): Promise<Response>;
}
