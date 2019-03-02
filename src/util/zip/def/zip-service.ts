
export interface ZipService {

    unzip(sourceZip: string, destUrl: string, successCallback?, onProgress?: Function);

    zip(sourceFolderPath: string, zipFilePath: string, directoriesToBeSkipped?: string[], filesToBeSkipped?: string[]): Promise<boolean>;
}
