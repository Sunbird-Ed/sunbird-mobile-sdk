export interface WebviewStateSessionProviderConfig {
    context: string;
    target: {
        host: string;
        path: string;
        params: {
            key: string;
            value: string;
        }[];
    };
    return: {
        type: string;
        when: {
            host: string;
            path: string;
            params: {
                key: string;
                resolveTo: string;
            }[];
        };
    }[];
}
