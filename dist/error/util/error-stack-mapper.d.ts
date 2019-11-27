import { ErrorStackEntry } from '../db/schema';
import { ErrorStack } from '../def/error-stack';
export declare class ErrorStackMapper {
    static mapErrorSatckDBEntryToErrorStack(errorStackEntry: ErrorStackEntry.SchemaMap): ErrorStack;
    static mapErrorStackToErrorStackDBEntry(errorStack: ErrorStack): ErrorStackEntry.SchemaMap;
}
