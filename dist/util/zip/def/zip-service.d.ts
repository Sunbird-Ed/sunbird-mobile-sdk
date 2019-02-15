export interface ZipService {
    unzip(sourceZip: string, destUrl: string, onProgress?: Function): Promise<number>;
    zip(sourceFolderPath: string, zipFilePath: string, directoriesToBeSkipped?: string[], filesToBeSkipped?: string[]): Promise<boolean>;
}
