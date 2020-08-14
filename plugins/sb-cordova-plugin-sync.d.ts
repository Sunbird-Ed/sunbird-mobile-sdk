// @ts-ignore
declare var sbsync: {

  sync: (success:
    (callbackUrl: any) => void, error: (error: string) => void) => void;

  enqueue: (data: any, request: any, shouldSync: boolean, success:
           (callbackUrl: any) => void, error: (error: string) => void) => void;

  onSyncSucces: (sucess: (data: any) => void, error?: (error: any) => void) => void;

  onAuthorizationError: (sucess: (data: any) => void, error?: (error: any) => void) => void;
};
