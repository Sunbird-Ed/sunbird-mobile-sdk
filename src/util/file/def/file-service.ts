import {Observable} from 'rxjs';
import {
    DirectoryEntry,
    Entry,
    FileEntry,
    Flags,
    LocalFileSystem,
    FileSystem,
    FileError,
    ErrorCallback,
    EntryCallback,
    RemoveResult, Metadata
} from '../index';


export interface FileService {

    readAsText(path: string, file: string): Promise<string>;

    createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry>;

    removeFile(path: string, fileName: string): Promise<RemoveResult>;

    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Promise<FileEntry>;

    createDir(path: string, dirName: string, replace: boolean): Promise<DirectoryEntry>;

    removeDir(path: string, dirName: string): Promise<RemoveResult>;

    removeRecursively(path: string, dirName: string): Promise<RemoveResult>;

    copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry>;

    copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry>;

    getMetaData(path: string): Promise<Metadata>;

    exists(path: string): Promise<FileEntry>;

    getTempLocation(destinationPath: string): Promise<DirectoryEntry>;

    getFreeDiskSpace(): Promise<number>;
}

