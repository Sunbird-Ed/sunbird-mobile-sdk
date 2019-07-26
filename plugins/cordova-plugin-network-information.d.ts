interface Navigator {
    connection: {
        type: string
    };
}

declare var Connection: {
    CELL: 'cellular',
    CELL_2G: '2g',
    CELL_3G: '3g',
    CELL_4G: '4g',
    ETHERNET: 'ethernet',
    NONE: 'none',
    UNKNOWN: 'unknown',
    WIFI: 'wifi'
};
