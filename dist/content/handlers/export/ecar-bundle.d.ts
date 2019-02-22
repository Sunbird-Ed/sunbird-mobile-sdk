import { FileService } from '../../../util/file/def/file-service';
import { ZipService } from '../../../util/zip/def/zip-service';
import { ExportContentContext } from '../..';
import { Response } from '../../../api';
export declare class EcarBundle {
    private fileService;
    private zipService;
    private static readonly FILE_SIZE;
    constructor(fileService: FileService, zipService: ZipService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
