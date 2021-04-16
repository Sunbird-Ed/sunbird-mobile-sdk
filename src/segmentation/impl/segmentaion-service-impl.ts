import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { InjectionTokens } from "../../injection-tokens";
import { KeyValueStore } from "../../key-value-store";
import { SegmentationService } from "../def/segmentation-service";
import { FetchSegmentationTagHandler } from "../handler/fetch-segmentation-tags-handler";
import { StoreSegmentationTagHandler } from "../handler/store-segmentation-tag-handler";

@injectable()
export class SegmentationServiceImpl implements SegmentationService {

    constructor(
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore
    ) {}

    putTags(tags: string, userId: string): Observable<boolean> {
        return new StoreSegmentationTagHandler(this.keyValueStore).handle(tags, userId);
    }

    getTags(userId: string): Observable<any> {
        return new FetchSegmentationTagHandler(this.keyValueStore).handle(userId);
    }
    
    removeTagsForId(userid: string): Observable<string> {
        throw new Error("Method not implemented.");
    }
    clearAllTags(): Observable<string> {
        throw new Error("Method not implemented.");
    }

}