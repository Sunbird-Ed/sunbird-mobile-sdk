import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { InjectionTokens } from "../../injection-tokens";
import { KeyValueStore } from "../../key-value-store";
import { SegmentationService } from "../def/segmentation-service";
import { FetchSegmentationCommandHandler } from "../handler/fetch-segmentation-command-handler";
import { FetchSegmentationTagHandler } from "../handler/fetch-segmentation-tags-handler";
import { StoreSegmentationCommandHandler } from "../handler/store-segmentation-command-handler";
import { StoreSegmentationTagHandler } from "../handler/store-segmentation-tag-handler";

@injectable()
export class SegmentationServiceImpl implements SegmentationService {

    constructor(
        @inject(InjectionTokens.KEY_VALUE_STORE) private keyValueStore: KeyValueStore
    ) {}

    saveTags(tags: string, userId: string): Observable<boolean> {
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

    saveCommandList(commandList, userId): Observable<any> {
        return new StoreSegmentationCommandHandler(this.keyValueStore).handle(commandList, userId);
    }

    getCommand(userId): Observable<any> {
        return new FetchSegmentationCommandHandler(this.keyValueStore).handle(userId);
    }

}