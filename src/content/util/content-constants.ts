export enum SearchType {
    SEARCH = 'search',
    FILTER = 'filter'
}

export enum ChildContents {
    ALL = 0, // Downloaded or spine both
    DOWNLOADED = 1, // All descendant downloaded contents
    SPINE = 2 // All descendant downloaded contents
}

export enum State {
    SEEN_BUT_NOT_AVAILABLE = 0, // Seen but not available (only serverData will be available)
    ONLY_SPINE = 1, // Only spine
    ARTIFACT_AVAILABLE = 2 // Artifact available
}

export enum MimeType {
    APK = 'application/vnd.android.package-archive',
    ECML = 'application/vnd.ekstep.ecml-archive',
    HTML = 'application/vnd.ekstep.html-archive',
    COLLECTION = 'application/vnd.ekstep.content-collection',

    ZIP = 'application/zip',
    TXT = 'text/plain',
    ECAR = 'application/ecar',
    EPAR = 'application/epar'
}

export enum Visibility {
    DEFAULT = 'Default',
    PARENT = 'Parent'
}

export enum ContentStatus {
    LIVE = 'Live',
    DRAFT = 'Draft'
}

export enum ContentEncoding {
    GZIP = 'gzip',
    IDENTITY = 'identity'
}

export enum ContentDisposition {
    ATTACHMENT = 'attachment',
    INLINE = 'inline',
    ONLINE = 'online'
}
