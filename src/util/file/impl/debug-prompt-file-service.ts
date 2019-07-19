import {FileService} from '../def/file-service';
import {DirectoryEntry, Entry, FileEntry, Flags, IWriteOptions, Metadata, RemoveResult} from '../index';
import {injectable} from 'inversify';

@injectable()
export class DebugPromptFileService implements FileService {
    copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry> {
        throw new Error('To be Implemented');
    }

    copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry> {
        throw new Error('To be Implemented');
    }

    createDir(path: string, replace: boolean): Promise<DirectoryEntry> {
        throw new Error('To be Implemented');
    }

    createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry> {
        throw new Error('To be Implemented');
    }

    exists(path: string): Promise<FileEntry> {
        throw new Error('To be Implemented');
    }

    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Promise<FileEntry> {
        throw new Error('To be Implemented');
    }

    getFreeDiskSpace(): Promise<number> {
        throw new Error('To be Implemented');
    }

    getMetaData(path: string): Promise<Metadata> {
        throw new Error('To be Implemented');
    }

    getTempLocation(destinationPath: string): Promise<DirectoryEntry> {
        throw new Error('To be Implemented');
    }

    readAsText(path: string, file: string): Promise<string> {
        return new Promise<string>(((resolve, reject) => {
            const result = prompt(`Enter contents for ${path}/${file}`);

            if (result) {
                return resolve(result);
            }

            reject('No Content');
        }));
    }

    removeDir(path: string, dirName: string): Promise<RemoveResult> {
        throw new Error('To be Implemented');
    }

    removeFile(path: string): Promise<RemoveResult> {
        throw new Error('To be Implemented');
    }

    removeRecursively(path: string): Promise<RemoveResult> {
        throw new Error('To be Implemented');
    }

    listDir(directoryPath: string): Promise<Entry[]> {
        throw new Error('To be Implemented');
    }

    writeFile(path: string, fileName: string, text: string, options: IWriteOptions): Promise<string> {
        throw new Error('To be Implemented');
    }

    getDirectorySize(path: string): Promise<number> {
        return Promise.resolve(0);
    }

    readFileFromAssets(fileName: string): Promise<string> {
        throw new Error('To be Implemented');
    }
}
