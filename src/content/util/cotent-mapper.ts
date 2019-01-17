import {ContentEntry} from '../db/schema';
import {Content, ContentData} from '../def/content';
import {GetContentDetailsHandler} from '../handlers/get-content-details-handler';
import {ContentUtil} from './content-util';

export class CotentMapper {
    public static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap {
        // TODO Swajanjit
        return {} as any;
    }

    public static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap): Content {
        const contentDbModel = JSON.parse('');
        let contentData;
        const serverData: ContentData = JSON.parse(contentDbModel.serverData);
        const localData: ContentData = JSON.parse(contentDbModel.localData);
        if (contentDbModel.localData) {
            contentData = contentDbModel.localData;
        }

        if (contentDbModel.serverData) {

            if (!contentDbModel.localData || !ContentUtil.isAvailableLocally(contentDbModel.contentState)) {
                contentData = contentDbModel.serverData;
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

        return {
            'identifier': contentDbModel.identifier,
            'contentData': contentData,
            'isUpdateAvailable': ContentUtil.isUpdateAvailable(serverData, localData),
            'mimeType': contentDbModel.mimeType,
            'basePath': contentDbModel.basePath,
            'contentType': contentDbModel.contentType,
            'isAvailableLocally': ContentUtil.isAvailableLocally(contentDbModel.contentState),
            'referenceCount': contentDbModel.referenceCount,
            'sizeOnDevice': contentDbModel.sizeOnDevice,
            'lastUsedTime': contentDbModel.lastUsedTime,
            'lastUpdatedTime': contentDbModel.lastUpdatedTime,
        };


    }
}
