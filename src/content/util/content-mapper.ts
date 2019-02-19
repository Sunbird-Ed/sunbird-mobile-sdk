import {ContentAccessEntry, ContentEntry} from '../db/schema';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {ContentUtil} from '../util/content-util';
import {Content, ContentData, ContentDetailRequest, ContentRequest} from '..';
import * as moment from 'moment';
import {ContentFeedbackService} from '../def/content-feedback-service';
import {ProfileService} from '../../profile';

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

    public static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, request?: ContentRequest,
                                             feedbackService?: ContentFeedbackService, profileService?: ProfileService): Content {
        let contentData;
        const serverInfo = contentEntry[ContentEntry.COLUMN_NAME_SERVER_DATA];
        const localInfo = contentEntry[ContentEntry.COLUMN_NAME_LOCAL_DATA];
        const serverData: ContentData = serverInfo && JSON.parse(serverInfo);
        const localData: ContentData = localInfo && JSON.parse(localInfo);
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

                if (!localData.me_totalRatings) {
                    localData.me_totalRatings = serverData.me_totalRatings;
                }

                if (!localData.me_averageRating) {
                    localData.me_averageRating = serverData.me_averageRating;
                }

                if (!localData.size) {
                    localData.size = serverData.size;
                }
            }
        }

        let contentCreationTime = 0;
        const localLastUpdatedTime = contentEntry[ContentEntry.COLUMN_NAME_LOCAL_LAST_UPDATED_ON];
        if (localLastUpdatedTime) {
            contentCreationTime = new Date(localLastUpdatedTime).getTime();
        }
        return {
            identifier: contentEntry[ContentEntry.COLUMN_NAME_IDENTIFIER],
            contentData: contentData,
            isUpdateAvailable: ContentUtil.isUpdateAvailable(serverData, localData),
            mimeType: contentEntry[ContentEntry.COLUMN_NAME_MIME_TYPE],
            basePath: contentEntry[ContentEntry.COLUMN_NAME_PATH]! || '',
            contentType: contentEntry[ContentEntry.COLUMN_NAME_CONTENT_TYPE],
            isAvailableLocally: ContentUtil.isAvailableLocally(contentEntry[ContentEntry.COLUMN_NAME_CONTENT_STATE]!),
            referenceCount: Number(contentEntry[ContentEntry.COLUMN_NAME_REF_COUNT]) || 0,
            sizeOnDevice: Number(contentEntry[ContentEntry.COLUMN_NAME_SIZE_ON_DEVICE]) || 0,
            lastUsedTime: Number(contentEntry[ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP]) || 0,
            lastUpdatedTime: contentCreationTime,
        };


    }
}
