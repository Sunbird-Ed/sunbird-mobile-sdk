import { FileService } from '../def/file-service';
import { DirectoryEntry, Entry, FileEntry, Flags, IWriteOptions, Metadata, RemoveResult } from '../index';
export declare class DebugPromptFileService implements FileService {
    copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry>;
    copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry>;
    createDir(path: string, replace: boolean): Promise<DirectoryEntry>;
    createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry>;
    exists(path: string): Promise<FileEntry>;
    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Promise<FileEntry>;
    getFreeDiskSpace(): Promise<number>;
    getMetaData(path: string): Promise<Metadata>;
    getTempLocation(destinationPath: string): Promise<DirectoryEntry>;
    readAsText(path: string, file: string): Promise<string>;
    removeDir(path: string, dirName: string): Promise<RemoveResult>;
    removeFile(path: string): Promise<RemoveResult>;
    removeRecursively(path: string): Promise<RemoveResult>;
    listDir(directoryPath: string): Promise<Entry[]>;
    writeFile(path: string, fileName: string, text: string, options: IWriteOptions): Promise<string>;
    getDirectorySize(path: string): Promise<number>;
}
