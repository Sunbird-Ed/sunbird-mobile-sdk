import {WebviewSessionProviderConfig} from '../../..';

export const mockManualMergeConfig: WebviewSessionProviderConfig = {
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
