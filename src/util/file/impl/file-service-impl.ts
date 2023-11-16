import {injectable} from 'inversify';
import {FileService} from '../def/file-service';
import {
    DirectoryEntry,
    DirectoryReader,
    Entry,
    EntryCallback,
    ErrorCallback,
    FileEntry,
    FileError,
    FileSystem,
    FileWriter,
    Flags,
    IWriteOptions,
    LocalFileSystem,
    Metadata,
    RemoveResult
} from '../index';
import {FileUtil} from '../util/file-util';

declare var cordova: {
    exec(
        successCallback: () => void,
        errorCallback: () => void,
        service: string,
        action: string,
        arguments: string[])
};

/**
 * Allows the user to look up the Entry for a file or directory referred to by a local URL.
 * @param url A URL referring to a local file in a filesystem accessable via this API.
 * @param successCallback A callback that is called to report the Entry to which the supplied URL refers.
 * @param errorCallback A callback that is called when errors happen, or when the request to obtain the Entry is denied.
 */

declare var resolveLocalFileSystemURL: (
    url: string,
    successCallback: EntryCallback,
    errorCallback?: ErrorCallback
) => void;

declare var file: {
    TEMPORARY: number;
    PERSISTENT: number;
    /* Android: the application space on external storage. */
    externalApplicationStorageDirectory: string;

    requestFileSystem(
        type: LocalFileSystem,
        size: number,
        successCallback: (fileSystem: FileSystem) => void,
        errorCallback?: (fileError: FileError) => void): void;
};

@injectable()
export class FileServiceImpl implements FileService {

    private fileSystem: FileSystem;
    private initialized = false;

    init() {
        file.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fs) => {
            this.initialized = true;
            this.fileSystem = fs;
        }, () => {

        });
    }

    readAsText(path: string, filePath: string): Promise<string> {
        return this.readFile<string>(path, filePath, 'Text');
    }

    readAsBinaryString(path: string, filePath: string): Promise<string> {
        return this.readFile<string>(path, filePath, 'BinaryString');
    }

    readFileFromAssets(fileName: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            try {
                sbutility.readFromAssets(fileName, (entry: string) => {
                    resolve(entry);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }

    writeFile(
        path: string,
        fileName: string,
        text: string,
        options: IWriteOptions = {}
    ): Promise<any> {
        const getFileOpts: Flags = {
            create: !options.append,
            exclusive: !options.replace
        };

        return this.resolveDirectoryUrl(path)
            .then((directoryEntry: DirectoryEntry) => {
                return this.getFile(directoryEntry, fileName, getFileOpts);
            })
            .then((fileEntry: FileEntry) => {
                return this.writeFileEntry(fileEntry, text, options);
            });
    }

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
    createFile(
        path: string,
        fileName: string,
        replace: boolean
    ): Promise<FileEntry> {

        const options: Flags = {
            create: true
        };

        if (!replace) {
            options.exclusive = true;
        }

        return this.resolveDirectoryUrl(path).then(fse => {
            return this.getFile(fse, fileName, options);
        });
    }


    getFile(
        directoryEntry: DirectoryEntry,
        fileName: string,
        flags: Flags
    ): Promise<FileEntry> {
        return new Promise<FileEntry>((resolve, reject) => {
            try {
                directoryEntry.getFile(fileName, flags, (entry: FileEntry) => {
                    resolve(entry);
                }, err => {
                    reject(err);
                });
            } catch (xc) {
                reject(xc);
            }
        });
    }

    /**
     * Removes a file from a desired location.
     *
     * @param {string} path  Base FileSystem. Please refer to the iOS and Android filesystem above
     * @returns {Promise<RemoveResult>} Returns a Promise that resolves to a RemoveResult or rejects with an error.
     */
    removeFile(path: string): Promise<RemoveResult> {
        const parentDir = FileUtil.getParentDir(path);
        const fileName = FileUtil.getFileName(path).replace('/', '');
        return this.resolveDirectoryUrl(parentDir)
            .then(fse => {
                return this.getFile(fse, fileName, {create: false});
            })
            .then(fe => {
                return this.remove(fe);
            });
    }


    createDir(
        path: string,
        replace: boolean
    ): Promise<DirectoryEntry> {

        const options: Flags = {
            create: true
        };

        if (!replace) {
            options.exclusive = true;
        }
        const parentDir = FileUtil.getParentDir(path);
        const dirName = FileUtil.getFileName(path).replace('/', '');
        return this.exists(path).then(() => {
            return this.resolveDirectoryUrl(path);
        }).catch(() => {
            return this.resolveDirectoryUrl(parentDir).then(fse => {
                return this.getDirectory(fse, dirName, options);
            });
        });
    }

    /**
     * List files and directory from a given path.
     *
     * @param {string} directoryPath. Please refer to the iOS and Android filesystems above
     * @returns {Promise<Entry[]>} Returns a Promise that resolves to an array of Entry objects or rejects with an error.
     */
    listDir(directoryPath: string): Promise<Entry[]> {

        return this.resolveDirectoryUrl(FileUtil.getDirecory(directoryPath))
            .then(fse => {
                return this.getDirectory(fse, FileUtil.getFileName(directoryPath), {
                    create: false,
                    exclusive: false
                });
            })
            .then(de => {
                const reader = de.createReader();
                return this.readEntries(reader);
            });
    }


    removeDir(path: string, dirName: string): Promise<RemoveResult> {
        return this.resolveDirectoryUrl(path)
            .then(fse => {
                return this.getDirectory(fse, dirName, {create: false});
            })
            .then(de => {
                return this.remove(de);
            });
    }

    /**
     * Removes all files and the directory from a desired location.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystem above
     * @returns {Promise<RemoveResult>} Returns a Promise that resolves with a RemoveResult or rejects with an error.
     */
    removeRecursively(path: string): Promise<RemoveResult> {
        path = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        const parentDir = FileUtil.getParentDir(path);
        const dirName = FileUtil.getFileName(path).replace('/', '');
        return this.resolveDirectoryUrl(parentDir)
            .then(fse => {
                return this.getDirectory(fse, dirName, {create: false});
            })
            .then(de => {
                return this.rimraf(de);
            });
    }

    /**
     * Copy a directory in various methods. If destination directory exists, will fail to copy.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystems above
     * @param {string} dirName Name of directory to copy
     * @param {string} newPath Base FileSystem of new location
     * @param {string} newDirName New name of directory to copy to (leave blank to remain the same)
     * @returns {Promise<Entry>} Returns a Promise that resolves to the new Entry object or rejects with an error.
     */
    copyDir(
        path: string,
        dirName: string,
        newPath: string,
        newDirName: string
    ): Promise<Entry> {

        return this.resolveDirectoryUrl(path)
            .then(fse => {
                return this.getDirectory(fse, dirName, {create: false});
            })
            .then(srcde => {
                return this.resolveDirectoryUrl(newPath).then(deste => {
                    return this.copy(srcde, deste, newDirName);
                });
            });
    }

    /**
     * Copy a file in various methods. If file exists, will fail to copy.
     *
     * @param {string} path Base FileSystem. Please refer to the iOS and Android filesystem above
     * @param {string} fileName Name of file to copy
     * @param {string} newPath Base FileSystem of new location
     * @param {string} newFileName New name of file to copy to (leave blank to remain the same)
     * @returns {Promise<Entry>} Returns a Promise that resolves to an Entry or rejects with an error.
     */
    copyFile(
        path: string,
        fileName: string,
        newPath: string,
        newFileName: string
    ): Promise<Entry> {
        newFileName = newFileName || fileName;

        return this.resolveDirectoryUrl(path)
            .then(fse => {
                return this.getFile(fse, fileName, {create: false});
            })
            .then(srcfe => {
                return this.resolveDirectoryUrl(newPath).then(deste => {
                    return this.copy(srcfe, deste, newFileName);
                });
            });
    }

    exists(path: string): Promise<Entry> {
        return this.resolveLocalFilesystemUrl(path);
    }

    getTempLocation(destinationPath: string): Promise<DirectoryEntry> {
        return this.resolveDirectoryUrl(destinationPath)
            .then((directoryEntry: DirectoryEntry) => {
                return this.resolveDirectoryUrl(destinationPath.concat('tmp'));
            }).catch(() => {
                return this.createDir(destinationPath.concat('tmp'), false);
            });
    }

    getFreeDiskSpace(): Promise<number> {
        return new Promise<any>((resolve, reject) => {
            cordova.exec(() => resolve, reject, 'File', 'getFreeDiskSpace', []);
        });
    }

    /**
     * Resolves a local file system URL
     * @param fileUrl {string} file system url
     * @returns {Promise<Entry>}
     */
    resolveLocalFilesystemUrl(fileUrl: string): Promise<Entry> {
        if (!fileUrl.includes('file://')) {
            fileUrl = 'file://' + fileUrl;
        }
        console.log(fileUrl);
        return new Promise<Entry>((resolve, reject) => {
            try {
                resolveLocalFileSystemURL(
                    fileUrl,
                    (entry: Entry) => {
                        resolve(entry);
                    },
                    err => {
                        reject(err);
                    }
                );
            } catch (xc) {
                reject(xc);
            }
        });
    }

    getMetaData(path: string | Entry): Promise<Metadata> {
        if (typeof path === 'string') {
            return this.resolveLocalFilesystemUrl(path).then(entry => {
                return this.getMetaData(entry);
            });
        }

        const fileEntry = path;
        return new Promise<Metadata>((resolve) => {
            fileEntry.getMetadata(metadata => {
                resolve(metadata);
            }, () => resolve({modificationTime: new Date(), size: 1}));
        });
    }

    getExternalApplicationStorageDirectory(): string {
        return file.externalApplicationStorageDirectory;
    }

    getDirectorySize(path: string): Promise<number> {
        return this.resolveDirectoryUrl(path)
            .then((directoryEntry: DirectoryEntry) => {
                return this.size(directoryEntry);
            }).catch(() => {
                return 0;
            });
    }

    size(entry: Entry): Promise<number> {
        if (entry.isFile) {
            return new Promise<number>((resolve, reject) => {
                entry.getMetadata(f => resolve(f.size), error => reject(error));
            });
        } else if (entry.isDirectory) {
            return new Promise<number>((resolve, reject) => {
                const directoryReader = (entry as DirectoryEntry).createReader();
                directoryReader.readEntries((entries: Entry[]) => {
                        Promise.all(entries.map(e => this.size(e))).then((size: number[]) => {
                            const dirSize = size.reduce((prev, current) => prev + current, 0);
                            resolve(dirSize);
                        }).catch(err => reject(err));
                    },
                    (error) => reject(error));
            });
        } else {
            return Promise.resolve(0);
        }
    }

    private readEntries(dr: DirectoryReader): Promise<Entry[]> {
        return new Promise<Entry[]>((resolve, reject) => {
            dr.readEntries(
                entries => {
                    resolve(entries);
                },
                err => {
                    reject(err);
                }
            );
        });
    }


    // remove(path: string | Entry): Promise<Metadata> {
    //     if (typeof path === 'string') {
    //         return this.resolveLocalFilesystemUrl(path).then(entry => {
    //             return this.remove(entry);
    //         });
    //     }
    //
    //     const fileEntry = path;
    //     return new Promise<Metadata>((resolve) => {
    //         fileEntry.remove(() => {
    //             resolve();
    //         }, () => resolve());
    //     });
    // }

    private readFile<T>(
        path: string,
        filePath: string,
        readAs: 'ArrayBuffer' | 'BinaryString' | 'DataURL' | 'Text'
    ): Promise<T> {

        return this.resolveDirectoryUrl(path)
            .then((directoryEntry: DirectoryEntry) => {
                return this.getFile(directoryEntry, filePath, {create: false});
            })
            .then((fileEntry: FileEntry) => {
                const reader = new FileReader();
                return new Promise<T>((resolve, reject) => {
                    reader.onloadend = () => {
                        if (reader.result !== undefined || reader.result !== null) {
                            resolve((reader.result as any) as T);
                        } else if (reader.error !== undefined || reader.error !== null) {
                            reject(reader.error);
                        } else {
                            reject({code: null, message: 'READER_ONLOADEND_ERR'});
                        }
                    };

                    fileEntry.file(
                        entry => {
                            reader[`readAs${readAs}`].call(reader, entry);
                        },
                        error => {
                            reject(error);
                        }
                    );
                });
            }).catch(err => {
                throw err;
            });
    }

    private resolveDirectoryUrl(directoryUrl: string): Promise<DirectoryEntry> {
        return this.resolveLocalFilesystemUrl(directoryUrl).then(de => {
            if (de.isDirectory) {
                return de as DirectoryEntry;
            } else {
                return Promise.reject<DirectoryEntry>('input is not a directory');
            }
        });
    }

    private remove(fe: Entry): Promise<RemoveResult> {
        return new Promise<RemoveResult>((resolve, reject) => {
            fe.remove(
                () => {
                    resolve({success: true, fileRemoved: fe});
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    private copy(
        srce: Entry,
        destdir: DirectoryEntry,
        newName: string
    ): Promise<Entry> {
        return new Promise<Entry>((resolve, reject) => {
            srce.copyTo(
                destdir,
                newName,
                deste => {
                    resolve(deste);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    private getDirectory(
        directoryEntry: DirectoryEntry,
        directoryName: string,
        flags: Flags
    ): Promise<DirectoryEntry> {
        return new Promise<DirectoryEntry>((resolve, reject) => {
            try {
                directoryEntry.getDirectory(
                    directoryName,
                    flags,
                    de => {
                        resolve(de);
                    },
                    err => {
                        reject(err);
                    }
                );
            } catch (xc) {
                reject(xc);
            }
        });
    }

    private rimraf(de: DirectoryEntry): Promise<RemoveResult> {
        return new Promise<RemoveResult>((resolve, reject) => {
            de.removeRecursively(
                () => {
                    resolve({success: true, fileRemoved: de});
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    private createWriter(fe: FileEntry): Promise<FileWriter> {
        return new Promise<FileWriter>((resolve, reject) => {
            fe.createWriter(
                writer => {
                    resolve(writer);
                },
                err => {
                    reject(err);
                }
            );
        });
    }

    /**
     * Write content to FileEntry.
     * @hidden
     * Write to an existing file.
     * @param {FileEntry} fe file entry object
     * @param {string | Blob | ArrayBuffer} text text content or blob to write
     * @param {IWriteOptions} options replace file if set to true. See WriteOptions for more information.
     * @returns {Promise<FileEntry>}  Returns a Promise that resolves to updated file entry or rejects with an error.
     */
    private writeFileEntry(
        fe: FileEntry,
        text: string,
        options: IWriteOptions
    ) {
        return this.createWriter(fe)
            .then(writer => {
                if (options.append) {
                    writer.seek(writer.length);
                }

                if (options.truncate) {
                    writer.truncate(options.truncate);
                }

                return this.write(writer, text);
            })
            .then(() => fe);
    }

    private write(
        writer: FileWriter,
        gu: string
    ): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            writer.onwriteend = evt => {
                if (writer.error) {
                    reject(writer.error);
                } else {
                    resolve(evt);
                }
            };
            writer.write(gu);
        });
    }
}
