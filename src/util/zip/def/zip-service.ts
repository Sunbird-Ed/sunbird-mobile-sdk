export interface ZipService {

    unzip(sourceZip: string, option, successCallback?, errorCallback?);

    zip(sourceFolderPath: string, option, directoriesToBeSkipped?: string[], filesToBeSkipped?: string[], successCallback?, errorCallback?);
}
