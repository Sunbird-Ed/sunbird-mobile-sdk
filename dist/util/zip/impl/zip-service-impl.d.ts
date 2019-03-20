import { ZipService } from '../def/zip-service';
export declare class ZipServiceImpl implements ZipService {
    unzip(sourceZip: string, option: any, successCallback?: any, errorCallback?: any): void;
    zip(sourceFolderPath: string, option: any, directoriesToBeSkipped: string[], filesToBeSkipped: string[], successCallback?: any, errorCallback?: any): void;
}
