import {QueryBuilder} from './query-builder';

describe('QueryBuilder', () => {
    it('should build a query string', () => {
        const q = new QueryBuilder()
            .where('a = ?')
            .args(['A'])
            .and()
            .where('b = ?')
            .args([2])
            .or()
            .where('c = ?')
            .args(['c'])
            .end()
            .build();

        expect(q).toEqual('a = "A" AND b = 2 OR c = "c"');
    });
});
