import {ContentAccessEntry, ContentEntry, ContentMarkerEntry} from '../db/schema';
import {ContentUtil} from '../util/content-util';
import {Content, ContentData} from '..';

export class ContentMapper {
    public static mapContentDataToContentDBEntry(contentData, manifestVersion: string): ContentEntry.SchemaMap {
        let serverLastUpdatedOn;
        let serverData;
        let localData;
        if (!manifestVersion) {
            serverLastUpdatedOn = contentData.lastUpdatedOn;
            serverData = JSON.stringify(contentData);
        } else {
            localData = JSON.stringify(contentData);
        }
        return {
            [ContentEntry.COLUMN_NAME_IDENTIFIER]: contentData.identifier,
            [ContentEntry.COLUMN_NAME_SERVER_DATA]: serverData,
            [ContentEntry.COLUMN_NAME_SERVER_LAST_UPDATED_ON]: serverLastUpdatedOn,
            [ContentEntry.COLUMN_NAME_MANIFEST_VERSION]: manifestVersion,
            [ContentEntry.COLUMN_NAME_LOCAL_DATA]: localData,
            [ContentEntry.COLUMN_NAME_MIME_TYPE]: contentData.mimeType,
            [ContentEntry.COLUMN_NAME_CONTENT_TYPE]: ContentUtil.readContentType(contentData),
            [ContentEntry.COLUMN_NAME_VISIBILITY]: ContentUtil.readVisibility(contentData),
            [ContentEntry.COLUMN_NAME_AUDIENCE]: ContentUtil.readAudience(contentData),
            [ContentEntry.COLUMN_NAME_PRAGMA]: ContentUtil.readPragma(contentData),
        };
    }

    public static mapServerResponseToContent(contentData, manifestVersion?: string): Content {
        let serverLastUpdatedOn;
        let serverData;
        let localData;
        if (!manifestVersion) {
            serverLastUpdatedOn = contentData.lastUpdatedOn;
            serverData = contentData;
        } else {
            localData = contentData;
        }
        return {
            identifier: contentData.identifier,
            contentData: contentData,
            isUpdateAvailable: ContentUtil.isUpdateAvailable(serverData, localData),
            mimeType: contentData.mimeType,
            basePath: '',
            contentType: ContentUtil.readContentType(contentData),
            isAvailableLocally: false,
            referenceCount: 0,
            sizeOnDevice: 0,
            lastUsedTime: 0,
            lastUpdatedTime: 0,
        };

    }

    public static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, shouldConvertBasePath?: boolean): Content {
        let contentData;
        const serverInfo = contentEntry[ContentEntry.COLUMN_NAME_SERVER_DATA];
        const localInfo = contentEntry[ContentEntry.COLUMN_NAME_LOCAL_DATA];
        const serverData: ContentData = serverInfo && JSON.parse(serverInfo);
        let localData: ContentData = localInfo && JSON.parse(localInfo);

        let identifier = contentEntry[ContentEntry.COLUMN_NAME_IDENTIFIER];
        let mimeType = contentEntry[ContentEntry.COLUMN_NAME_MIME_TYPE];
        let visibility = contentEntry[ContentEntry.COLUMN_NAME_VISIBILITY];
        let contentType = contentEntry[ContentEntry.COLUMN_NAME_CONTENT_TYPE];
        let lastUsedTime = 0;
        if (contentEntry.hasOwnProperty(ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP)) {
            lastUsedTime = contentEntry[ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP];
        }

        if (contentEntry.hasOwnProperty(ContentMarkerEntry.COLUMN_NAME_DATA)) {
            if (!localData) {
                localData = JSON.parse(contentEntry[ContentMarkerEntry.COLUMN_NAME_DATA]);
            }
            if (localData) {
                identifier = localData.identifier;
                mimeType = localData.mimeType;
                visibility = ContentUtil.readVisibility(localData);
                contentType = ContentUtil.readContentType(localData);
            }
        }
        if (localData) {
            contentData = localData;
        }

        if (serverData) {

            if (!localData || !ContentUtil.isAvailableLocally(contentEntry[ContentEntry.COLUMN_NAME_CONTENT_STATE]!)) {
                contentData = serverData;
            } else {
                if (!localData.streamingUrl) {
                    localData.streamingUrl = serverData.streamingUrl;
                }

                if (!localData.previewUrl) {
                    localData.previewUrl = serverData.previewUrl;
                }

                if (!localData.me_totalRatingsCount) {
                    localData.me_totalRatingsCount = serverData.me_totalRatingsCount;
                }

                if (!localData.me_averageRating) {
                    localData.me_averageRating = serverData.me_averageRating;
                }

                if (!localData.size) {
                    localData.size = serverData.size;
                }

                if (!localData.licenseDetails) {
                    localData.licenseDetails = serverData.licenseDetails;
                }
            }
        }

        let contentCreationTime = 0;
        const localLastUpdatedTime = contentEntry[ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON];
        if (localLastUpdatedTime) {
            contentCreationTime = new Date(localLastUpdatedTime).getTime();
        }

        const sizeOnDevice = Number(contentEntry[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE]);
        const size = sizeOnDevice ? sizeOnDevice : Number(serverData ? serverData.size : 0 );

        const basePath = contentEntry[ContentEntry.COLUMN_NAME_PATH]! || '';
        return {
            identifier: identifier,
            contentData: contentData,
            isUpdateAvailable: ContentUtil.isUpdateAvailable(serverData, localData),
            mimeType: mimeType,
            basePath: !shouldConvertBasePath ? basePath :  '/_app_file_' + basePath   ,
            contentType: contentType,
            isAvailableLocally: ContentUtil.isAvailableLocally(contentEntry[ContentEntry.COLUMN_NAME_CONTENT_STATE]!),
            referenceCount: Number(contentEntry[ContentEntry.COLUMN_NAME_REF_COUNT]) || 0,
            sizeOnDevice: size,
            lastUsedTime: lastUsedTime || 0,
            lastUpdatedTime: contentCreationTime,
        };


    }
}
