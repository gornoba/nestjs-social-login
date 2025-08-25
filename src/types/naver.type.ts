export class NaverAuth {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: string;
  error?: string;
  error_description?: string;
}

export class NaverUser {
  resultcode: '00' | string;
  message: 'success' | string;
  response: {
    id: string;
    nickname: string;
    age:
      | '1~9'
      | '10~14'
      | '15~19'
      | '20~29'
      | '30~39'
      | '40~49'
      | '50~59'
      | '60~69'
      | '70~79'
      | '80~89'
      | '90~';
    gender: 'M' | 'F' | 'U';
    email: string;
    mobile: string;
    mobile_e164: string;
    name: string;
    birthday: string;
    birthyear: string;
  };
}
