import {NumberUtil} from './number-util';

describe('NumberUtil', () => {
    describe('toFixed()', () => {
        it('should return float with fixed precision of 2', () => {
            expect(NumberUtil.toFixed(2.123456)).toEqual(2.12);
        });
    });

    describe('parseInt()', () => {
        it('should return parsed Int', () => {
            expect(NumberUtil.parseInt(2.123456)).toEqual(2);
            expect(NumberUtil.parseInt('2.123456')).toEqual(2);
            expect(NumberUtil.parseInt('0')).toEqual(0);
        });
    });

    describe('round()', () => {
        it('should return rounded float with precision of 4', () => {
            expect(NumberUtil.round(2.123456)).toEqual(2.1235);
            expect(NumberUtil.round('2.123456')).toEqual(2.1235);
            expect(NumberUtil.round('0')).toEqual(0);
        });
    });
});
