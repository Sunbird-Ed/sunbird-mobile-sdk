import { ContentEntry } from '../db/schema';
import { Content, ContentData, ContentRequest } from '..';
import { ContentFeedbackService } from '../def/content-feedback-service';
import { ProfileService } from '../../profile';
export declare class ContentMapper {
    static mapContentDataToContentDBEntry(contentData: ContentData): ContentEntry.SchemaMap;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, request?: ContentRequest, feedbackService?: ContentFeedbackService, profileService?: ProfileService): Content;
}
