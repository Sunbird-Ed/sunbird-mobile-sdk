import { FileService } from '../def/file-service';
import { Observable } from 'rxjs';
import { DirectoryEntry, FileEntry, Flags } from '..';
export declare class FileServiceImpl implements FileService {
    createDir(path: string, dirName: string, replace: boolean): Observable<DirectoryEntry>;
    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Observable<FileEntry>;
    readAsText(path: string, file: string): Observable<string>;
    resolveDirectoryUrl(directoryUrl: string): Observable<DirectoryEntry>;
}
