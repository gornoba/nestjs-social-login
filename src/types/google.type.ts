export interface GoogleRequest {
  clientId: string;
  secretKey: string;
  redirectUri: string;
}

export class GoogleAuth {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: 'Bearer';
  id_token: string;
}

export class GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
  hd: string;
}
