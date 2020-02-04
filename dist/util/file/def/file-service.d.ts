import { DirectoryEntry, Entry, FileEntry, Flags, IWriteOptions, Metadata, RemoveResult } from '../index';
export interface FileService {
    readAsText(path: string, file: string): Promise<string>;
    readAsBinaryString(path: string, file: string): Promise<string>;
    readFileFromAssets(fileName: string): Promise<string>;
    writeFile(path: string, fileName: string, text: string, options: IWriteOptions): Promise<string>;
    createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry>;
    removeFile(path: string): Promise<RemoveResult>;
    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Promise<FileEntry>;
    createDir(path: string, replace: boolean): Promise<DirectoryEntry>;
    listDir(directoryPath: string): Promise<Entry[]>;
    removeDir(path: string, dirName: string): Promise<RemoveResult>;
    removeRecursively(path: string): Promise<RemoveResult>;
    copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry>;
    copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry>;
    getMetaData(path: string): Promise<Metadata>;
    exists(path: string): Promise<Entry>;
    getTempLocation(destinationPath: string): Promise<DirectoryEntry>;
    getFreeDiskSpace(): Promise<number>;
    getDirectorySize(path: string): Promise<number>;
}
