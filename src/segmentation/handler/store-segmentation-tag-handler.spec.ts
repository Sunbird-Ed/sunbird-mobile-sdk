import { of } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
import { StoreSegmentationTagHandler } from "./store-segmentation-tag-handler";


describe('FetchSegmentationTagHandler', () => {
    let storeSegmentationTagHandler: StoreSegmentationTagHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {
        setValue: jest.fn(() => of(true))
    };

    beforeAll(() => {
        storeSegmentationTagHandler = new StoreSegmentationTagHandler(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of storeSegmentationTagHandler', () => {
        expect(storeSegmentationTagHandler).toBeTruthy();
    });

    it('should return observable string', (done) => {
        // arrange
        const userid = "userId";
        const tags = "tags";
        const tagKey = 'segment-tag_';
        //act
        storeSegmentationTagHandler.handle(tags, userid).subscribe(() => {
        // assert
            expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(tagKey + userid, tags);
            done();
        });
    })

    
});