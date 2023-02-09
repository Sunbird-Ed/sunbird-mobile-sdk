import { of } from 'rxjs';
import { NoActiveSessionError } from '../..';
import { KeyValueStore } from '../../key-value-store';
import { StoreSegmentationTagHandler } from '../handler/store-segmentation-tag-handler';
import { SegmentationServiceImpl } from './segmentaion-service-impl';

describe('SegmentationServiceImpl', () => {
    let segmentationServiceImpl: SegmentationServiceImpl;
    const mockKeyValueStore: Partial<KeyValueStore> = {};

    beforeAll(() => {
        segmentationServiceImpl = new SegmentationServiceImpl(
            mockKeyValueStore as KeyValueStore
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of segmentationServiceImpl', () => {
        expect(segmentationServiceImpl).toBeTruthy();
    });

    it('should return true for save the Tags', (done) => {
        const tag = 'sample-tag';
        const userId = 'sample-uid';
        mockKeyValueStore.setValue = jest.fn(() => of(true));
        segmentationServiceImpl.saveTags(tag, userId).subscribe(() => {
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should return the tags', (done) => {
        const userId = 'sample-uid';
        mockKeyValueStore.getValue = jest.fn(() => of('segment'));
        segmentationServiceImpl.getTags(userId).subscribe(() => {
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });

    it('should save command list', (done) => {
        mockKeyValueStore.setValue = jest.fn(() => of(true));
        segmentationServiceImpl.saveCommandList([{id: 'sample-id'}], 'sample-uid').subscribe(() => {
            expect(mockKeyValueStore.setValue).toHaveBeenCalled();
            done();
        });
    });

    it('should return a list', (done) => {
        mockKeyValueStore.getValue = jest.fn(() => of('list'));
        segmentationServiceImpl.getCommand('sample-userid').subscribe(() => {
            expect(mockKeyValueStore.getValue).toHaveBeenCalled();
            done();
        });
    });
});
