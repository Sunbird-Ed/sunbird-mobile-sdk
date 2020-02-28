import {WebviewSessionProviderConfig} from '../../..';

export const mockMigrateConfig: WebviewSessionProviderConfig = {
    'context': 'migrate',
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
            },
            {
                'key': 'automerge',
                'value': '1'
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
        }
    ]
};
