import {FileService} from '../def/file-service';
import {Observable} from 'rxjs';
import {DirectoryEntry, FileEntry, Flags} from '..';

export class FileServiceImpl implements FileService {
    createDir(path: string, dirName: string, replace: boolean): Observable<DirectoryEntry> {
        throw new Error('To Be implemented');
    }

    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Observable<FileEntry> {
        throw new Error('To Be implemented');
    }

    readAsText(path: string, file: string): Observable<string> {
        throw new Error('To Be implemented');
    }

    resolveDirectoryUrl(directoryUrl: string): Observable<DirectoryEntry> {
        throw new Error('To Be implemented');
    }
}
