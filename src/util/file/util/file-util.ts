export class FileUtil {
    public static getFileExtension(filePath: string): string {
        const extension: string = filePath.substring((filePath.lastIndexOf('.') + 1), filePath.length);
        if (extension) {
            return '';
        } else {
            return extension;
        }
    }

    public static getFileName(filePath: string): string {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
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
}
