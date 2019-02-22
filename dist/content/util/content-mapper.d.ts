import { ContentEntry } from '../db/schema';
import { Content, ContentRequest } from '..';
import { ContentFeedbackService } from '../def/content-feedback-service';
import { ProfileService } from '../../profile';
export declare class ContentMapper {
    static mapContentDataToContentDBEntry(contentData: any, manifestVersion: string): ContentEntry.SchemaMap;
    static mapServerResponseToContent(contentData: any, manifestVersion?: string): Content;
    static mapContentDBEntryToContent(contentEntry: ContentEntry.SchemaMap, request?: ContentRequest, feedbackService?: ContentFeedbackService, profileService?: ProfileService): Content;
}
