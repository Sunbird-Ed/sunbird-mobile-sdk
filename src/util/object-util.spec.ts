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

    describe('equals', () => {
        it('should return false if type is not matched', () => {
            const a = {fname: 'jhon', lname: 'Doe'};
            const b = '';
            expect(JSON.stringify(ObjectUtil.equals(a, b))).toBe('false');
        });

        it('should return false if countProps are different', () => {
            const a = {fname: 'jhon', lname: 'Doe'};
            const b = [{fname: 'jhon', lname: 'Doe'}];
            expect(JSON.stringify(ObjectUtil.equals(a, b))).toBe('false');
        });

        it('should return true if arguments is function', () => {
            const a = (number) => {
                return number;
            };
            const square = (number) => {
                return number * number;
            };
            expect(JSON.stringify(ObjectUtil.equals(square, square))).toBe('true');
        });

        it('should return true if arguments is function', () => {
            const a = {fname: 'jhon', lname: 'Doe'};
            const square = {fname: 'jhon', lname: 'Doe'};
            expect(JSON.stringify(ObjectUtil.equals(square, square))).toBe('true');
        });

        it('should return true if arguments is function', () => {
            const a = [{fname: 'jhon', lname: 'Doe'}];
            const square = [{fname: 'jhon', lname: 'Doe'}];
            expect(JSON.stringify(ObjectUtil.equals(square, square))).toBe('true');
        });

        it('should return true if arguments is function', () => {
            const a = [{fname: 'jhon', lname: 'Doe'}];
            const b = [{id: 'do-id'}];
            expect(JSON.stringify(ObjectUtil.equals(a, b))).toBe('false');
        });
    });

    describe('getPropDiff', () => {
        it('should return key difference', () => {
            const newObj = {id: 'sample-id'};
            const oldObj = {uid: 'sample-uid'};
            expect(JSON.stringify(ObjectUtil.getPropDiff(newObj, oldObj))).toBe('[\"id\"]');
        });
    });
});
