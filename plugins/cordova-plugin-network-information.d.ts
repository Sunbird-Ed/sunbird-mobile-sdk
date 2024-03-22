// interface Navigator {
//     connection: {
//         type: string
//     };
// }

interface ConnectionStatus {
    connected:	boolean	
    connectionType: 'wifi' | 'cellular' | 'none' | 'unknown'
}
interface Capacitor {
    Plugins: {
        Network: {
            getStatus: () => Promise<ConnectionStatus>
        }
    }
}

declare var Connection: {
    CELL: 'cellular',
    NONE: 'none',
    UNKNOWN: 'unknown',
    WIFI: 'wifi'
};
