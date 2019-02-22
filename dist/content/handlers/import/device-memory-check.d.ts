import { FileService } from '../../../util/file/def/file-service';
import { ImportContentContext } from '../..';
import { Response } from '../../../api';
export declare class DeviceMemoryCheck {
    private fileService;
    freeDiskSpace: number;
    constructor(fileService: FileService);
    execute(importContext: ImportContentContext): Promise<Response>;
    calculateBufferSize(ecarFileSize: number): number;
}
