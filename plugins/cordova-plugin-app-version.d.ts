interface Capacitor {
    Plugins: {
        App: {
            getInfo:  (cb: ({
                name: string,
                id: string,
                build: string,
                version: string
            }) => void) => void;
        }
    }
}
