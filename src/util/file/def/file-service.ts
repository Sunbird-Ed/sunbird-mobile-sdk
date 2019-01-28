import {Observable} from 'rxjs';
import {DirectoryEntry, FileEntry, Flags} from '..';

export interface FileService {
    readAsText(path: string, file: string): Observable<string>;

    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Observable<FileEntry>;

    createDir(path: string, dirName: string, replace: boolean): Observable<DirectoryEntry>;

    resolveDirectoryUrl(directoryUrl: string): Observable<DirectoryEntry>;
}
