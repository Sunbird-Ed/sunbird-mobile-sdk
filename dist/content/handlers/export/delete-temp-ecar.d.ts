import { FileService } from '../../../util/file/def/file-service';
import { ExportContentContext } from '../..';
import { Response } from '../../../api';
export declare class DeleteTempEcar {
    private fileService;
    constructor(fileService: FileService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
