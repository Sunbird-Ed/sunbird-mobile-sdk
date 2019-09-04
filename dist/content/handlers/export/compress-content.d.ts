import { ZipService } from '../../../util/zip/def/zip-service';
import { ExportContentContext } from '../..';
import { Response } from '../../../api';
export declare class CompressContent {
    private zipService;
    constructor(zipService: ZipService);
    execute(exportContentContext: ExportContentContext): Promise<Response>;
}
