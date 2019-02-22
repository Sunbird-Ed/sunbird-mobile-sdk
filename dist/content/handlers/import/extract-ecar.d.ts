import { ImportContentContext } from '../..';
import { Response } from '../../../api';
import { FileService } from '../../../util/file/def/file-service';
import { ZipService } from '../../../util/zip/def/zip-service';
export declare class ExtractEcar {
    private fileService;
    private zipService;
    private readonly FILE_SIZE;
    constructor(fileService: FileService, zipService: ZipService);
    execute(importContext: ImportContentContext): Promise<Response>;
}
