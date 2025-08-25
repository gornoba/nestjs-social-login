import { Algorithm } from 'jsonwebtoken';

export interface AppleToken {
  iss: string; // 토큰 발급자 (항상 Apple)
  aud: string; // 대상 (Service ID 또는 Bundle ID)
  exp: number; // 만료 시간 (Unix timestamp)
  iat: number; // 발행 시간 (Unix timestamp)
  sub: string; // 애플에서 발급한 고유 사용자 ID
  email: string; // 사용자의 이메일 (선택적으로 제공)
  email_verified: string; // 이메일 인증 여부
  is_private_email: string; // 애플 프라이빗 릴레이 이메일 여부
  nonce_supported: boolean; // Nonce 사용 가능 여부
}

export interface ApplePublicKey {
  kty: string;
  kid: string;
  use: string;
  alg: Algorithm;
}

export class AppleRedirectDto {
  code: string;
  id_token: string;
  state: string;
  user: string;
  body?: string;
}

export class AppleUserDto {
  name: { firstName: string; lastName: string };
  email: string;
}
