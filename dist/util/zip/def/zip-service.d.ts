export interface ZipService {
    unzip(sourceZip: string, option: any, successCallback?: any, errorCallback?: any): any;
    zip(sourceFolderPath: string, option: any, directoriesToBeSkipped?: string[], filesToBeSkipped?: string[], successCallback?: any, errorCallback?: any): any;
}
