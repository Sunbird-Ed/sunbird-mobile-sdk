import { ZipService } from '../../../util/zip/def/zip-service';
import { ExportContentContext } from '../..';
import { Response } from '../../../api';
import { FileService } from '../../../util/file/def/file-service';
export declare class CompressContent {
    private zipService;
    private fileService;
    constructor(zipService: ZipService, fileService: FileService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
