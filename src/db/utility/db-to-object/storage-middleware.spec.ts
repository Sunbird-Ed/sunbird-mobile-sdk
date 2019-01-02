import {StorageMiddleware} from './storage-middleware';

describe('StorageMiddleware', () => {
    it('should convert into db', () => {
        // arrange
        const obj = {
            prop: 'val',
            prop1: ['val1', 'val2']
        };

        // act
        const result = StorageMiddleware.toDb(obj);

        // assert
        expect(result).toEqual({
            prop: 'val',
            prop1: '["val1","val2"]'
        })
    });

    it('should convert back to obj', () => {
        // arrange
        const obj = {
            prop: 'val',
            prop1: '["val1","val2"]'
        };

        // act
        const result = StorageMiddleware.fromDb(obj);

        // assert
        expect(result).toEqual({
            prop: 'val',
            prop1: ['val1', 'val2']
        })
    });
});
