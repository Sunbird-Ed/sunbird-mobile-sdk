import { ErrorStackEntry } from '../db/schema';
import {ErrorStack} from '../def/error-stack';

export class ErrorStackMapper {
    public static mapErrorSatckDBEntryToErrorStack(errorStackEntry: ErrorStackEntry.SchemaMap): ErrorStack {
        return {
            appver: errorStackEntry[ErrorStackEntry.COLUMN_NAME_APP_VERSION],
            pageid: errorStackEntry[ErrorStackEntry.COLUMN_NAME_PAGE_ID],
            ts: errorStackEntry[ErrorStackEntry.COLUMN_NAME_TIME_STAMP],
            log: errorStackEntry[ErrorStackEntry.COLUMN_NAME_ERROR_LOG]
        };
    }

    public static mapErrorStackToErrorStackDBEntry(errorStack: ErrorStack): ErrorStackEntry.SchemaMap {
        return {
            [ErrorStackEntry.COLUMN_NAME_APP_VERSION]: errorStack.appver,
            [ErrorStackEntry.COLUMN_NAME_PAGE_ID]: errorStack.pageid,
            [ErrorStackEntry.COLUMN_NAME_TIME_STAMP]: errorStack.ts,
            [ErrorStackEntry.COLUMN_NAME_ERROR_LOG]: errorStack.log
        };
    }
}
