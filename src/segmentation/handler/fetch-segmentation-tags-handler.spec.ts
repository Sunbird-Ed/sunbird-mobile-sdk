import { of } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
import { FetchSegmentationTagHandler } from "./fetch-segmentation-tags-handler";

describe('FetchSegmentationTagHandler', () => {
    let fetchSegmentationTagHandler: FetchSegmentationTagHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {
        getValue: jest.fn(() => of('stored value'))
    };

    beforeAll(() => {
        fetchSegmentationTagHandler = new FetchSegmentationTagHandler(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of fetchSegmentationTagHandler', () => {
        expect(fetchSegmentationTagHandler).toBeTruthy();
    });

    it('should return observable string', (done) => {
        // arrange
        const userid = "userId";
        const tagKey = "segment-tag_";
        //act
        fetchSegmentationTagHandler.handle(userid).subscribe(() => {
        // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalledWith(tagKey + userid);
            done();
        });
    })

    
});