export declare class FileUtil {
    static getFileExtension(filePath: string): string;
    static getFileName(filePath: string): string;
    static getParentDir(directoryPath: string): string;
    static getDirectoryName(filePath: string): string;
    static getTempDirPath(externalFilesDir: string): string;
    static isFreeSpaceAvailable(deviceAvailableFreeSpace: number, fileSpace: number, bufferSize: number): boolean;
    static getDirecory(path: string): string;
}
