import { of } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
import { FetchSegmentationCommandHandler } from './fetch-segmentation-command-handler';

describe('FetchSegmentationCommandHandler', () => {
    let fetchSegmentationCommandHandler: FetchSegmentationCommandHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {
        getValue: jest.fn(() => of('stored value'))
    };

    beforeAll(() => {
        fetchSegmentationCommandHandler = new FetchSegmentationCommandHandler(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of fetchSegmentationCommandHandler', () => {
        expect(fetchSegmentationCommandHandler).toBeTruthy();
    });

    it('should return observable string', (done) => {
        // arrange
        const userid = "userId";
        const commandKey = "segment-command_";
        //act
        fetchSegmentationCommandHandler.handle(userid).subscribe(() => {
        // assert
            expect(mockKeyValueStore.getValue).toHaveBeenCalledWith(commandKey + userid);
            done();
        });
    })

    
});