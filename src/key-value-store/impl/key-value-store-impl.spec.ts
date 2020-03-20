import { KeyValueStoreImpl } from './key-value-store-impl';
import { DbService } from '../..';
import { of } from 'rxjs';

describe('KeyValueStoreImpl', () => {
    let keyValueStoreImpl: KeyValueStoreImpl;
    const mockDbService: Partial<DbService> = {};

    beforeAll(() => {
        keyValueStoreImpl = new KeyValueStoreImpl(
            mockDbService as DbService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of keyValueStoreImpl', () => {
        expect(keyValueStoreImpl).toBeTruthy();
    });

    it('should read the data from no_sql', (done) => {
        // arrange
        const key = 'SAMPLE_KEY';
        mockDbService.read = jest.fn().mockImplementation(() => of([]));
        // act
        keyValueStoreImpl.getValue(key).subscribe(() => {
            // assert
            expect(mockDbService.read).toHaveBeenCalled();
            done();
        });
    });

    it('should update to no_sql table ', (done) => {
        // arrange
        const key = 'SAMPLE_KEY';
        const value = 'SAMPLE_VALUE';
        spyOn(keyValueStoreImpl, 'getValue').and.returnValue(of({}));
        mockDbService.update = jest.fn().mockImplementation(() => of([]));
        // act
        keyValueStoreImpl.setValue(key, value).subscribe(() => {
            // assert
            expect(keyValueStoreImpl.getValue).toHaveBeenCalledWith(key);
            expect(mockDbService.update).toHaveBeenCalled();
            done();
        });
    });

    it('should insert to no_sql table ', (done) => {
        // arrange
        const key = 'SAMPLE_KEY';
        const value = 'SAMPLE_VALUE';
        spyOn(keyValueStoreImpl, 'getValue').and.returnValue(of(undefined));
        mockDbService.insert = jest.fn().mockImplementation(() => of([]));
        // act
        keyValueStoreImpl.setValue(key, value).subscribe(() => {
            // assert
            expect(keyValueStoreImpl.getValue).toHaveBeenCalledWith(key);
            expect(mockDbService.insert).toHaveBeenCalled();
            done();
        });
    });
});
