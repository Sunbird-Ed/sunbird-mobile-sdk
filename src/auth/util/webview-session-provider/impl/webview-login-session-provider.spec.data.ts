import {WebviewSessionProviderConfig} from '../../..';

export const loginConfig: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'password',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'code',
                        'resolveTo': 'code'
                    }
                ]
            }
        },
        {
            'type': 'google',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'googleRedirectUrl',
                        'resolveTo': 'googleRedirectUrl'
                    }
                ]
            }
        },
        {
            'type': 'state',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/sso/sign-in/success',
                'params': [
                    {
                        'key': 'id',
                        'resolveTo': 'id'
                    }
                ]
            }
        },
        {
            'type': 'state-error',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/sso/sign-in/error',
                'params': [
                    {
                        'key': 'error_message',
                        'resolveTo': 'error_message'
                    }
                ]
            }
        },
        {
            'type': 'migrate',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
                'params': [
                    {
                        'key': 'automerge',
                        'resolveTo': 'automerge'
                    },
                    {
                        'key': 'payload',
                        'resolveTo': 'payload'
                    },
                    {
                        'key': 'state',
                        'resolveTo': 'state'
                    },
                    {
                        'key': 'userId',
                        'resolveTo': 'userId'
                    },
                    {
                        'key': 'identifierType',
                        'resolveTo': 'identifierType'
                    },
                    {
                        'key': 'identifierValue',
                        'resolveTo': 'identifierValue'
                    },
                    {
                        'key': 'goBackUrl',
                        'resolveTo': 'goBackUrl'
                    }
                ]
            }
        },
        {
            'type': 'reset',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
                'params': [
                    {
                        'key': 'client_id',
                        'resolveTo': 'client_id'
                    }
                ]
            }
        }
    ]
};

export const loginConfigForStateError: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'state-error',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/sso/sign-in/error',
                'params': [
                    {
                        'key': 'error_message',
                        'resolveTo': 'error_message'
                    }
                ]
            }
        }
    ]
};

export const mergeConfig: WebviewSessionProviderConfig = {
    'context': 'merge',
    'target': {
        'host': 'https://merge.staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            },
            {
                'key': 'merge_account_process',
                'value': '1'
            },
            {
                'key': 'mergeaccountprocess',
                'value': '1'
            },
            {
                'key': 'goBackUrl',
                'value': 'https://merge.staging.ntp.net.in/?exit=1'
            }
        ]
    },
    'return': [
        {
            'type': 'password',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'code',
                        'resolveTo': 'code'
                    }
                ]
            }
        },
        {
            'type': 'google',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'googleRedirectUrl',
                        'resolveTo': 'googleRedirectUrl'
                    }
                ]
            }
        },
        {
            'type': 'exit',
            'when': {
                'host': 'https://merge.staging.ntp.net.in',
                'path': '/',
                'params': [
                    {
                        'key': 'exit',
                        'resolveTo': 'exit'
                    }
                ]
            }
        }
    ]
};

export const loginConfigForReset: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'reset',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
                'params': [
                    {
                        'key': 'client_id',
                        'resolveTo': 'client_id'
                    }
                ]
            }
        }
    ]
};

export const loginConfigForPassword: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'password',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'code',
                        'resolveTo': 'code'
                    }
                ]
            }
        }
    ]
};

export const loginConfigForState: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'state',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/sso/sign-in/success',
                'params': [
                    {
                        'key': 'id',
                        'resolveTo': 'id'
                    }
                ]
            }
        }
    ]
};

export const loginConfigForGoogle: WebviewSessionProviderConfig = {
    'context': 'login',
    'target': {
        'host': 'https://staging.ntp.net.in',
        'path': '/auth/realms/sunbird/protocol/openid-connect/auth',
        'params': [
            {
                'key': 'redirect_uri',
                'value': 'https://staging.ntp.net.in/oauth2callback'
            },
            {
                'key': 'response_type',
                'value': 'code'
            },
            {
                'key': 'scope',
                'value': 'offline_access'
            },
            {
                'key': 'client_id',
                'value': 'android'
            },
            {
                'key': 'version',
                'value': '4'
            }
        ]
    },
    'return': [
        {
            'type': 'google',
            'when': {
                'host': 'https://staging.ntp.net.in',
                'path': '/oauth2callback',
                'params': [
                    {
                        'key': 'googleRedirectUrl',
                        'resolveTo': 'googleRedirectUrl'
                    }
                ]
            }
        },
    ]
};
