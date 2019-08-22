export interface MergeServerProfilesRequest {
  from: {
    userId: string;
    accessToken: string;
  };
  to: {
    userId: string;
    accessToken: string;
  };
}
