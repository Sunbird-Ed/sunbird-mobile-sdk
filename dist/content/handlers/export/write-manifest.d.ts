import { FileService } from '../../../util/file/def/file-service';
import { Response } from '../../../api';
import { ExportContentContext } from '../..';
export declare class WriteManifest {
    private fileService;
    private static readonly MANIFEST_FILE_NAME;
    constructor(fileService: FileService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
