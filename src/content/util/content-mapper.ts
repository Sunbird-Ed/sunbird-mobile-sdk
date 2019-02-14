import {ContentAccessEntry, ContentEntry} from '../db/schema';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {ContentUtil} from '../util/content-util';
import {Content, ContentData, ContentDetailRequest, ContentRequest} from '..';
import * as moment from 'moment';
import {ContentFeedbackService} from '../def/content-feedback-service';
import {ProfileService} from '../../profile';

export class ContentMapper {
    public static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap {
        // TODO Swajanjit
        return {} as any;
    }

    public static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, request?: ContentRequest,
                                             feedbackService?: ContentFeedbackService, profileService?: ProfileService): Content {
        let contentData;
        const serverData: ContentData = JSON.parse(contentEntry[ContentEntry.COLUMN_NAME_SERVER_DATA]);
        const localData: ContentData = JSON.parse(contentEntry[ContentEntry.COLUMN_NAME_LOCAL_DATA]);
        if (localData) {
            contentData = localData;
        }

        if (serverData) {

            if (!localData || !ContentUtil.isAvailableLocally(contentEntry[ContentEntry.COLUMN_NAME_CONTENT_STATE])) {
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

        const content = {
            identifier: contentEntry[ContentEntry.COLUMN_NAME_IDENTIFIER],
            contentData: contentData,
            isUpdateAvailable: ContentUtil.isUpdateAvailable(serverData, localData),
            mimeType: contentEntry[ContentEntry.COLUMN_NAME_MIME_TYPE],
            basePath: contentEntry[ContentEntry.COLUMN_NAME_PATH],
            contentType: contentEntry[ContentEntry.COLUMN_NAME_CONTENT_TYPE],
            isAvailableLocally: ContentUtil.isAvailableLocally(contentEntry[ContentEntry.COLUMN_NAME_CONTENT_STATE]),
            referenceCount: Number(contentEntry[ContentEntry.COLUMN_NAME_IDENTIFIER]),
            sizeOnDevice: Number(contentEntry[ContentEntry.COLUMN_NAME_IDENTIFIER]),
            lastUsedTime: contentEntry[ContentAccessEntry.COLUMN_NAME_EPOCH_TIMESTAMP],
            lastUpdatedTime: contentCreationTime,
        };
        return content;


    }
}
