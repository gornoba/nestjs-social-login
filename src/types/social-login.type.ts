export interface KakaoLoginConfig {
  restApiKey: string;
  secretKey?: string;
  scope?: string;
  state?: string;
}

export interface GoogleLoginConfig {
  clientId: string;
  clientSecret: string;
  scope?: string;
  state?: string;
}

export interface NaverLoginConfig {
  clientId: string;
  clientSecret: string;
  state: string;
}

export interface AppleLoginConfig {
  clientId: string;
  issuer: string;
  state?: string;
}

export interface SocialLoginInterface {
  domain: string;
  kakaoLoginConfig?: KakaoLoginConfig;
  googleLoginConfig?: GoogleLoginConfig;
  naverLoginConfig?: NaverLoginConfig;
  appleLoginConfig?: AppleLoginConfig;
}
