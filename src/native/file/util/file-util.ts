export class FileUtil {
    public static getFileExtension(filePath: string): string {
        const extension: string = filePath.substring((filePath.lastIndexOf('.') + 1), filePath.length);
        return extension ? extension : '';
    }

    public static getFileName(filePath: string): string {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }

    public static getParentDir(directoryPath: string): string {
        return directoryPath.substr(0, directoryPath.lastIndexOf('/', directoryPath.length - 2)).concat('/');
    }

    public static getDirectoryName(filePath: string): string {
        const dirNames = filePath.split('/');
        return dirNames[dirNames.length - 2];
    }

    public static getTempDirPath(externalFilesDir: string): string {
        return externalFilesDir + '/tmp';
    }

    public static isFreeSpaceAvailable(deviceAvailableFreeSpace: number, fileSpace: number, bufferSize: number) {
        let BUFFER_SIZE: number = 1024 * 10;
        if (bufferSize > 0) {
            BUFFER_SIZE = bufferSize;
        }
        return deviceAvailableFreeSpace > 0 && deviceAvailableFreeSpace > (fileSpace + BUFFER_SIZE);
    }

    public static getDirecory(path: string): string {
        return path.substr(0, path.lastIndexOf('/'));
    }
}
