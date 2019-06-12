import { DbService } from '../../db';
import { Observable } from 'rxjs';
import { ErrorStackService } from '../def/error-stack-service';
import { ErrorStack } from '../def/error-stack';
import { ErrorStackEntry } from '../db/schema';
import { Container, inject, injectable } from 'inversify';
import { InjectionTokens } from '../../injection-tokens';
import { ErrorStackMapper } from '../util/error-stack-mapper';


@injectable()
export class ErrorStackImpl implements ErrorStackService {

    constructor(@inject(InjectionTokens.CONTAINER) private container: Container,
        @inject(InjectionTokens.DB_SERVICE) private dbService: DbService) {
    }

    createErrorStack(errorStack: ErrorStack): Observable<ErrorStack> {
        return this.dbService.insert({
            table: ErrorStackEntry.TABLE_NAME,
            modelJson: ErrorStackMapper.mapErrorStackToErrorStackDBEntry(errorStack)
        }).map(() => errorStack);
    }

    deleteErrorStack(): Observable<undefined> {
        return this.dbService.execute(`DELETE FROM ${ErrorStackEntry.TABLE_NAME}`)
            .mapTo(undefined);
    }

    getAllErrorStack(): Observable<ErrorStack[]> {
        return this.dbService.read({
            table: ErrorStackEntry.TABLE_NAME,
            columns: []
        }).map((errors: ErrorStackEntry.SchemaMap[]) =>
            errors.map((errorStack: ErrorStackEntry.SchemaMap) => ErrorStackMapper.mapErrorSatckDBEntryToErrorStack(errorStack))
        );

    }

    stackCount(): Observable<number> {
        return this.dbService.execute(`
        SELECT COUNT(*) as count FROM ${ErrorStackEntry.TABLE_NAME}`
        ).map((result) => result);
    }
}
