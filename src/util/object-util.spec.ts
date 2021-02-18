import {ObjectUtil} from './object-util';

describe('ObjectUtil', () => {
    describe('withDeeplyOrderedKeys()', () => {
        it('should deeply order object with sorted keys', () => {
            const obj = {
                'c': {
                    'e': 'e',
                    'd': 'd'
                },
                'b': 'b',
                'a': 'a'
            };
            
            expect(
                JSON.stringify(ObjectUtil.withDeeplyOrderedKeys(obj))
            ).toEqual(
                '{"a":"a","b":"b","c":{"d":"d","e":"e"}}'
            );
        });

        it('should deeply order object with sorted keys excluding arrays', () => {
            const obj = {
                'c': {
                    'e': 'e',
                    'f': [5, 0, 1, 2, 3, 4],
                    'd': 'd'
                },
                'b': 'b',
                'a': 'a'
            };

            expect(
                JSON.stringify(ObjectUtil.withDeeplyOrderedKeys(obj))
            ).toEqual(
                '{"a":"a","b":"b","c":{"d":"d","e":"e","f":[5,0,1,2,3,4]}}'
            );
        });
    });
});
