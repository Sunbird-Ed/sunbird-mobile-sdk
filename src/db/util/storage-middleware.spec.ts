import {ObjectMapper, NoSqlFormatter} from './storage-middleware';

describe('NoSqlFormatter', () => {
    it('should convert into db', () => {
        // arrange
        const obj = {
            prop: 'val',
            prop1: ['val1', 'val2']
        };

        // act
        const result = NoSqlFormatter.toDb(obj);

        // assert
        expect(result).toEqual({
            prop: 'val',
            prop1: '["val1","val2"]'
        });
    });

    it('should convert back to obj', () => {
        // arrange
        const obj = {
            prop: 'val',
            prop1: '["val1","val2"]'
        };

        // act
        const result = NoSqlFormatter.fromDb(obj);

        // assert
        expect(result).toEqual({
            prop: 'val',
            prop1: ['val1', 'val2']
        });
    });
});

describe('ObjectMapper', () => {
    it('should', () => {
        // arrange
        const source = {
            key1: 'val1',
            key2: 'val2',
            key3: 'val3'
        };

        const target = ObjectMapper.map(source, {myKey1: 'key1', myKey2: 'key2'});

        expect(target).toEqual({
            myKey1: 'val1',
            myKey2: 'val2'
        });
    });
});
