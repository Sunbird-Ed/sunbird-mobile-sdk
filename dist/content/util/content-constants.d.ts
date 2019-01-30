export declare enum SearchType {
    SEARCH = "search",
    FILTER = "filter"
}
export declare enum ChildContents {
    ALL = 0,
    DOWNLOADED = 1,
    SPINE = 2
}
export declare enum State {
    SEEN_BUT_NOT_AVAILABLE = 0,
    ONLY_SPINE = 1,
    ARTIFACT_AVAILABLE = 2
}
export declare enum MimeType {
    APK = "application/vnd.android.package-archive",
    ECML = "application/vnd.ekstep.ecml-archive",
    HTML = "application/vnd.ekstep.html-archive",
    COLLECTION = "application/vnd.ekstep.content-collection",
    ZIP = "application/zip",
    TXT = "text/plain",
    ECAR = "application/ecar",
    EPAR = "application/epar"
}
export declare enum Visibility {
    DEFAULT = "Default",
    PARENT = "Parent"
}
export declare enum ContentStatus {
    LIVE = "Live",
    DRAFT = "Draft"
}
export declare enum ContentEncoding {
    GZIP = "gzip",
    IDENTITY = "identity"
}
export declare enum ContentDisposition {
    ATTACHMENT = "attachment",
    INLINE = "inline",
    ONLINE = "online"
}
