import { of } from 'rxjs';
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

});