import { CorrelationData, Environment, ImpressionSubtype, PageId, Rollup, TelemetryImpressionRequest, TelemetryInteractRequest } from '..';
export declare class TelemetryRequestFactory {
    static generateBackClickedTelemetry(pageId: PageId, env: Environment, isNavBack: boolean, identifier?: string, corRelationList?: CorrelationData[]): TelemetryInteractRequest;
    static generatePageViewTelemetry(pageId: PageId, env: Environment, subType?: ImpressionSubtype): TelemetryImpressionRequest;
    static generateSpineLoadingTelemetry(content: any, isFirstTime: boolean): TelemetryInteractRequest;
    static generateCancelDownloadTelemetry(content: any): TelemetryInteractRequest;
    static generateDownloadAllClickTelemetry(pageId: PageId, content: any, downloadingIdentifier: any, childrenCount: number): TelemetryInteractRequest;
    static generatePullToRefreshTelemetry(pageId: PageId, env: Environment): TelemetryInteractRequest;
    static generateReadLessOrReadMore(param: any, objRollup: Rollup, corRelationList: CorrelationData[], telemetryObject: any): TelemetryInteractRequest;
    static generateProfilePopulatedTelemetry(pageId: PageId, frameworkId: any, mode: any): TelemetryInteractRequest;
    static generateExtraInfoTelemetry(values: {
        [key: string]: any;
    }, pageId: PageId): TelemetryInteractRequest;
    static generateContentCancelClickedTelemetry(content: any, downloadProgress: string): TelemetryInteractRequest;
}
