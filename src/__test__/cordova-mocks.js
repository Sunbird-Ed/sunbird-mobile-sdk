global.cordova = {
    plugin: {
        http: {
            setDataSerializer: () => {
            },
            setHeader: () => {
            },
            get: () => {
            },
            post: () => {
            },
            put: () => {
            },
            patch: () => {
            },
        }
    },
    plugins: {
        notification: {
            local: {
                lanchDetails: {},
                getScheduledIds: () => {
                },
                schedule: () => {
                }
            }
        },
        diagnostic: {
            switchToSettings: () => {
            }
        }
    },
    file: {
        applicationDirectory: '/path',
        externalCacheDirectory: "file:///some_external_cache_root/some_path/"
    },
    InAppBrowser: {
        open: () => ({
            addEventListener: () => {
            },
        }),
    },
    getAppVersion: {
        getAppName: () => {}
    }
};

global.plugins = {
    Preferences: {
        configure: () => {
        }
    }
};

global.JJzip = {
    unzip: () => {
    },
    zip: () => {
    }
};

global.supportfile = {
    shareSunbirdConfigurations: () => {
    }
};

global.sbutility = {
    getMetaData: () => {
    },
    copyFile: () => {

    },
    createDirectories: () => {
    },
    rm: () => {
    },
    copyDirectory: () => {
    },
    getFreeUsableSpace: () => {
    },
    canWrite: () => {
    },
    getBuildConfigValue: () => {
    },
    writeFile: () => {},
    getUtmInfo: () => {},
    renameDirectory: () => {}
};

global.sbutility = {
    getMetaData: () => {

    },
    copyFile: () => {

    },
    createDirectories: () => {

    },
    rm: () => {},
    copyDirectory: () => {},
    getFreeUsableSpace: () => {},
    canWrite: () => {},
    getBuildConfigValue: () => {}
};

global.customtabs = {
    isAvailable: () => {
    },
    launch: () => {
    },
    launchInBrowser: () => {
    }
};

global.sbsync = {
    enqueue: () => {
    }
};

global.downloadManager = {
    fetchSpeedLog: () => {
    }
};


global.db = {
    update: () => {
    },
    delete: () => {
    },
    read: () => {
    },
    execute: () => {
    },
    insert: () => {
    },
    endTransaction: () => {
    },
    beginTransaction: () => {
    },
    copyDatabase: () => {
    },
    open: () => {
    }
};


global.DownloadStatus = {
    STATUS_FAILED: 0x00000010,
    STATUS_PAUSED: 0x00000004,
    STATUS_PENDING: 0x00000001,
    STATUS_RUNNING: 0x00000002,
    STATUS_SUCCESSFUL: 0x00000008
}