import { of } from "rxjs";
import { KeyValueStore } from "../../key-value-store";
import  { StoreSegmentationCommandHandler } from './store-segmentation-command-handler';


describe('StoreSegmentationCommandHandler', () => {
    let storeSegmentationCommandHandler: StoreSegmentationCommandHandler;
    const mockKeyValueStore: Partial<KeyValueStore> = {
        setValue: jest.fn(() => of(true))
    };

    beforeAll(() => {
        storeSegmentationCommandHandler = new StoreSegmentationCommandHandler(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of StoreSegmentationCommandHandler', () => {
        expect(storeSegmentationCommandHandler).toBeTruthy();
    });

    it('should call setValue with commandKey and commandList', (done) => {
        // arrange
        const userId = "userId";
        const commandList = ["command"];
        const commandKey = "segment-command_";
        //act
        storeSegmentationCommandHandler.handle(commandList, userId).subscribe(() => {
        // assert
            expect(mockKeyValueStore.setValue).toHaveBeenCalledWith(commandKey + userId, commandList);
            done();
        });
    })

    
});