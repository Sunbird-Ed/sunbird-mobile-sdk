import {QueryBuilder} from './query-builder';

describe('QueryBuilder', () => {
    it('should build a query string', () => {
        const q = new QueryBuilder()
            .where('? = ?')
            .args(['a', 'b'])
            .and()
            .where('? = ?')
            .args(['a', 'b'])
            .or()
            .where('? = ?')
            .args(['a', 'b'])
            .end()
            .build();

        expect(q).toEqual('a = b AND a = b OR a = b');
    });
});
