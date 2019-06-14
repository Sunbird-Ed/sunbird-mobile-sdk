import { ErrorStackEntry } from '../db/schema';
import { ErrorStack } from '..';

export class ErrorStackMapper {
    public static mapErrorSatckDBEntryToErrorStack(errorStackEntry: ErrorStackEntry.SchemaMap): ErrorStack {
        return {
            appVersion: errorStackEntry[ErrorStackEntry.COLUMN_NAME_APP_VERSION],
            stackTrace: errorStackEntry[ErrorStackEntry.COLUMN_NAME_STACK_TRACE],
            pageId: errorStackEntry[ErrorStackEntry.COLUMN_NAME_PAGE_ID],
            errorType: errorStackEntry[ErrorStackEntry.COLUMN_NAME_ERROR_TYPE]
        };
    }

    public static mapErrorStackToErrorStackDBEntry(errorStack: ErrorStack): ErrorStackEntry.SchemaMap {
        return {
            [ErrorStackEntry.COLUMN_NAME_APP_VERSION]: errorStack.appVersion!,
            [ErrorStackEntry.COLUMN_NAME_STACK_TRACE]: errorStack.stackTrace,
            [ErrorStackEntry.COLUMN_NAME_PAGE_ID]: errorStack.pageId,
            [ErrorStackEntry.COLUMN_NAME_ERROR_TYPE]: errorStack.errorType
        };
    }
}
