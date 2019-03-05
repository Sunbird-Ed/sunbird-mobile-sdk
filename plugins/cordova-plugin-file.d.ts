interface Window {
    TEMPORARY: number;
    PERSISTENT: number;

    /**
     * Requests a filesystem in which to store application data.
     * @param type              Whether the filesystem requested should be persistent, as defined above. Use one of TEMPORARY or PERSISTENT.
     * @param size              This is an indicator of how much storage space, in bytes, the application expects to need.
     * @param successCallback   The callback that is called when the user agent provides a filesystem.
     * @param errorCallback     A callback that is called when errors happen, or when the request to obtain the filesystem is denied.
     */
    requestFileSystem(
        type: LocalFileSystem,
        size: number,
        successCallback: (fileSystem: FileSystem) => void,
        errorCallback?: (fileError: FileError) => void): void;

    /**
     * Look up file system Entry referred to by local URL.
     * @param string url       URL referring to a local file or directory
     * @param successCallback  invoked with Entry object corresponding to URL
     * @param errorCallback    invoked if error occurs retrieving file system entry
     */
    resolveLocalFileSystemURL(url: string,
                              successCallback: (entry: Entry) => void,
                              errorCallback?: (error: FileError) => void): void;

    /**
     * Look up file system Entry referred to by local URI.
     * @param string uri       URI referring to a local file or directory
     * @param successCallback  invoked with Entry object corresponding to URI
     * @param errorCallback    invoked if error occurs retrieving file system entry
     */
    resolveLocalFileSystemURI(uri: string,
                              successCallback: (entry: Entry) => void,
                              errorCallback?: (error: FileError) => void): void;
}

/*
 * Constants defined in fileSystemPaths
 */
interface Cordova {
    file: {
        /* Read-only directory where the application is installed. */
        applicationDirectory: string;
        /* Root of app's private writable storage */
        applicationStorageDirectory: string;
        /* Where to put app-specific data files. */
        dataDirectory: string;
        /* Cached files that should survive app restarts. Apps should not rely on the OS to delete files in here. */
        cacheDirectory: string;
        /* Android: the application space on external storage. */
        externalApplicationStorageDirectory: string;
        /* Android: Where to put app-specific data files on external storage. */
        externalDataDirectory: string;
        /* Android: the application cache on external storage. */
        externalCacheDirectory: string;
        /* Android: the external storage (SD card) root. */
        externalRootDirectory: string;
        /* iOS: Temp directory that the OS can clear at will. */
        tempDirectory: string;
        /* iOS: Holds app-specific files that should be synced (e.g. to iCloud). */
        syncedDataDirectory: string;
        /* iOS: Files private to the app, but that are meaningful to other applciations (e.g. Office files) */
        documentsDirectory: string;
        /* BlackBerry10: Files globally available to all apps */
        sharedDirectory: string
    };
}

declare var FileError: {
    new(code: number): FileError;
    NOT_FOUND_ERR: number;
    SECURITY_ERR: number;
    ABORT_ERR: number;
    NOT_READABLE_ERR: number;
    ENCODING_ERR: number;
    NO_MODIFICATION_ALLOWED_ERR: number;
    INVALID_STATE_ERR: number;
    SYNTAX_ERR: number;
    INVALID_MODIFICATION_ERR: number;
    QUOTA_EXCEEDED_ERR: number;
    TYPE_MISMATCH_ERR: number;
    PATH_EXISTS_ERR: number;
};

/* FileWriter states */
declare var FileWriter: {
    INIT: number;
    WRITING: number;
    DONE: number
};
