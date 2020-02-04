import { FileService } from '../def/file-service';
import { DirectoryEntry, Entry, FileEntry, Flags, IWriteOptions, Metadata, RemoveResult } from '../index';
export declare class FileServiceImpl implements FileService {
    private fileSystem;
    private initialized;
    init(): void;
    readAsText(path: string, filePath: string): Promise<string>;
    readAsBinaryString(path: string, filePath: string): Promise<string>;
    readFileFromAssets(fileName: string): Promise<string>;
    writeFile(path: string, fileName: string, text: string, options?: IWriteOptions): Promise<any>;
    /**
     * Creates a new file in the specific path.
     * The replace boolean value determines whether to replace an existing file with the same name.
     * If an existing file exists and the replace value is false, the promise will fail and return an error.
     *
     * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystem above
     * @param {string} fileName Name of file to create
     * @param {boolean} replace If true, replaces file with same name. If false returns error
     * @returns {Promise<FileEntry>} Returns a Promise that resolves to a FileEntry or rejects with an error.
     */
    createFile(path: string, fileName: string, replace: boolean): Promise<FileEntry>;
    getFile(directoryEntry: DirectoryEntry, fileName: string, flags: Flags): Promise<FileEntry>;
    /**
     * Removes a file from a desired location.
     *
     * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystem above
     * @returns {Promise<RemoveResult>} Returns a Promise that resolves to a RemoveResult or rejects with an error.
     */
    removeFile(path: string): Promise<RemoveResult>;
    createDir(path: string, replace: boolean): Promise<DirectoryEntry>;
    /**
     * List files and directory from a given path.
     *
     * @param {string} directoryPath. Please refer to the iOS and Android filesystems above
     * @returns {Promise<Entry[]>} Returns a Promise that resolves to an array of Entry objects or rejects with an error.
     */
    listDir(directoryPath: string): Promise<Entry[]>;
    removeDir(path: string, dirName: string): Promise<RemoveResult>;
    /**
     * Removes all files and the directory from a desired location.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystem above
     * @returns {Promise<RemoveResult>} Returns a Promise that resolves with a RemoveResult or rejects with an error.
     */
    removeRecursively(path: string): Promise<RemoveResult>;
    /**
     * Copy a directory in various methods. If destination directory exists, will fail to copy.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
     * @param {string} dirName Name of directory to copy
     * @param {string} newPath Base FileSystem of new location
     * @param {string} newDirName New name of directory to copy to (leave blank to remain the same)
     * @returns {Promise<Entry>} Returns a Promise that resolves to the new Entry object or rejects with an error.
     */
    copyDir(path: string, dirName: string, newPath: string, newDirName: string): Promise<Entry>;
    /**
     * Copy a file in various methods. If file exists, will fail to copy.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystem above
     * @param {string} fileName Name of file to copy
     * @param {string} newPath Base FileSystem of new location
     * @param {string} newFileName New name of file to copy to (leave blank to remain the same)
     * @returns {Promise<Entry>} Returns a Promise that resolves to an Entry or rejects with an error.
     */
    copyFile(path: string, fileName: string, newPath: string, newFileName: string): Promise<Entry>;
    exists(path: string): Promise<Entry>;
    getTempLocation(destinationPath: string): Promise<DirectoryEntry>;
    getFreeDiskSpace(): Promise<number>;
    /**
     * Resolves a local file system URL
     * @param fileUrl {string} file system url
     * @returns {Promise<Entry>}
     */
    resolveLocalFilesystemUrl(fileUrl: string): Promise<Entry>;
    getMetaData(path: string | Entry): Promise<Metadata>;
    getExternalApplicationStorageDirectory(): string;
    getDirectorySize(path: string): Promise<number>;
    size(entry: Entry): Promise<number>;
    private readEntries;
    private readFile;
    private resolveDirectoryUrl;
    private remove;
    private copy;
    private getDirectory;
    private rimraf;
    private createWriter;
    /**
     * Write content to FileEntry.
     * @hidden
     * Write to an existing file.
     * @param {FileEntry} fe file entry object
     * @param {string | Blob | ArrayBuffer} text text content or blob to write
     * @param {IWriteOptions} options replace file if set to true. See WriteOptions for more information.
     * @returns {Promise<FileEntry>}  Returns a Promise that resolves to updated file entry or rejects with an error.
     */
    private writeFileEntry;
    private write;
}
