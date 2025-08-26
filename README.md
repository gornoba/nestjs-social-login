# NestJS Social Login

NestJS에서 Apple, Google, Kakao, Naver 소셜 로그인을 쉽게 구현할 수 있는 모듈입니다.

## 설치

```bash
npm install nestj-social-login
```

## 의존성

이 모듈은 다음 패키지들을 필요로 합니다:

```json
{
  "dependencies": {
    "@nestjs/common": "^8 || ^9 || ^10 || ^11",
    "@nestjs/core": "^8 || ^9 || ^10 || ^11",
    "reflect-metadata": "^0.1.13 || ^0.2.0",
    "rxjs": "^7.5.6",
    "axios": "^1.0.0",
    "jsonwebtoken": "^9.0.0",
    "jwk-to-pem": "^3.0.0"
  }
}
```

## 기본 설정

### 1. 모듈 설정

```typescript
import { Module } from "@nestjs/common";
import { SocialLoginModule } from "nestj-social-login";

@Module({
  imports: [
    SocialLoginModule.forRoot({
      domain: "https://yourdomain.com",
      kakaoLoginConfig: {
        restApiKey: "your_kakao_rest_api_key",
        secretKey: "your_kakao_secret_key", // 선택사항
        scope: "profile_nickname,profile_image", // 선택사항
        state: "your_state_value", // 선택사항
      },
      googleLoginConfig: {
        clientId: "your_google_client_id",
        clientSecret: "your_google_client_secret",
        scope: "openid email profile", // 선택사항
        state: "your_state_value", // 선택사항
      },
      naverLoginConfig: {
        clientId: "your_naver_client_id",
        clientSecret: "your_naver_client_secret",
        state: "your_state_value", // 필수
      },
      appleLoginConfig: {
        clientId: "your_apple_client_id",
        issuer: "https://appleid.apple.com", // 필수
        state: "your_state_value", // 선택사항
      },
    }),
  ],
})
export class AppModule {}
```

### 2. 환경변수 설정

`.env` 파일에 다음을 추가하세요:

```env
# Kakao
KAKAO_REST_API_KEY=your_kakao_rest_api_key
KAKAO_SECRET_KEY=your_kakao_secret_key

# Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Naver
NAVER_CLIENT_ID=your_naver_client_id
NAVER_CLIENT_SECRET=your_naver_client_secret

# Apple
APPLE_CLIENT_ID=your_apple_client_id
APPLE_ISSUER=https://appleid.apple.com

# Domain
DOMAIN=https://yourdomain.com
```

## 사용방법

### Kakao 로그인

#### 1. 컨트롤러 설정

```typescript
import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { KakaoLoginGuard } from "nestj-social-login";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  @Get("kakao")
  @UseGuards(KakaoLoginGuard)
  async kakaoLogin(@Req() req: Request) {
    // 카카오 로그인 성공 후 처리
    const { kakaoAuth, kakaoUser, state } = req["kakaoData"];

    // kakaoAuth: 액세스 토큰, 리프레시 토큰 등
    // kakaoUser: 사용자 정보 (이름, 이메일, 프로필 이미지 등)
    // state: 상태값

    return {
      message: "Kakao login successful",
      user: kakaoUser,
      auth: kakaoAuth,
    };
  }
}
```

#### 2. 카카오 개발자 콘솔 설정

1. [Kakao Developers](https://developers.kakao.com/)에서 애플리케이션 생성
2. REST API 키와 Secret 키 발급
3. 플랫폼 > Web > 사이트 도메인에 `https://yourdomain.com` 추가
4. 카카오 로그인 > Redirect URI에 `https://yourdomain.com/auth/kakao` 추가

#### 3. 응답 데이터 구조

```typescript
// kakaoAuth
{
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

// kakaoUser
{
  id: number;
  connected_at: string;
  properties: {
    nickname: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
  kakao_account: {
    profile_needs_agreement: boolean;
    profile: {
      nickname: string;
      thumbnail_image_url?: string;
      profile_image_url?: string;
    };
    email_needs_agreement: boolean;
    email?: string;
    age_range_needs_agreement: boolean;
    age_range?: string;
    birthday_needs_agreement: boolean;
    birthday?: string;
    gender_needs_agreement: boolean;
    gender?: string;
  };
}
```

### Google 로그인

#### 1. 컨트롤러 설정

```typescript
import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { GoogleLoginGuard } from "nestj-social-login";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  @Get("google")
  @UseGuards(GoogleLoginGuard)
  async googleLogin(@Req() req: Request) {
    // 구글 로그인 성공 후 처리
    const { googleAuth, googleUser, state } = req["googleData"];

    // googleAuth: 액세스 토큰, 리프레시 토큰 등
    // googleUser: 사용자 정보 (이름, 이메일, 프로필 이미지 등)
    // state: 상태값

    return {
      message: "Google login successful",
      user: googleUser,
      auth: googleAuth,
    };
  }
}
```

#### 2. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/)에서 프로젝트 생성
2. OAuth 2.0 클라이언트 ID 생성
3. 승인된 리디렉션 URI에 `https://yourdomain.com/auth/google` 추가
4. 클라이언트 ID와 클라이언트 시크릿 발급

#### 3. 응답 데이터 구조

```typescript
// googleAuth
{
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  id_token: string;
}

// googleUser
{
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}
```

### Naver 로그인

#### 1. 컨트롤러 설정

```typescript
import { Controller, Get, UseGuards, Req } from "@nestjs/common";
import { NaverLoginGuard } from "nestj-social-login";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  @Get("naver")
  @UseGuards(NaverLoginGuard)
  async naverLogin(@Req() req: Request) {
    // 네이버 로그인 성공 후 처리
    const { naverAuth, naverUser, state } = req["naverData"];

    // naverAuth: 액세스 토큰, 리프레시 토큰 등
    // naverUser: 사용자 정보 (이름, 이메일, 프로필 이미지 등)
    // state: 상태값

    return {
      message: "Naver login successful",
      user: naverUser,
      auth: naverAuth,
    };
  }
}
```

#### 2. Naver Developers 설정

1. [Naver Developers](https://developers.naver.com/)에서 애플리케이션 생성
2. 클라이언트 ID와 클라이언트 시크릿 발급
3. 서비스 URL에 `https://yourdomain.com` 추가
4. Callback URL에 `https://yourdomain.com/auth/naver` 추가

#### 3. 응답 데이터 구조

```typescript
// naverAuth
{
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  error?: string;
  error_description?: string;
}

// naverUser
{
  resultcode: string;
  message: string;
  response: {
    id: string;
    nickname: string;
    name: string;
    email: string;
    gender: string;
    age: string;
    birthday: string;
    profile_image?: string;
    birthyear: string;
    mobile: string;
  };
}
```

### Apple 로그인

#### 1. 컨트롤러 설정

```typescript
import { Controller, Post, UseGuards, Req, Body } from "@nestjs/common";
import { AppleLoginGuard } from "nestj-social-login";
import { Request } from "express";

@Controller("auth")
export class AuthController {
  @Post("apple")
  @UseGuards(AppleLoginGuard)
  async appleLogin(@Req() req: Request, @Body() body: any) {
    // 처음 보내면 redirect URL을 return

    // 애플 로그인 성공 후 처리
    const { appleAuth, state, user } = req["appleData"];

    // appleAuth: 검증된 JWT 토큰 정보
    // state: 상태값
    // user: 이름, 이메일 (최초 로그인에만 적용)

    return {
      message: "Apple login successful",
      auth: appleAuth,
    };
  }
}
```

#### 2. Apple Developer 설정

1. [Apple Developer](https://developer.apple.com/)에서 App ID 생성
2. Sign In with Apple 기능 활성화
3. Services ID 생성 및 Sign In with Apple 설정
4. 클라이언트 ID와 클라이언트 시크릿 발급
5. Return URLs에 `https://yourdomain.com/auth/apple` 추가

#### 3. 응답 데이터 구조

```typescript
// appleAuth (검증된 JWT 토큰)
{
  appleAuth: {
    iss: string; // 토큰 발급자
    aud: string; // 대상 클라이언트 ID
    exp: number; // 만료 시간
    iat: number; // 발급 시간
    sub: string; // 사용자 식별자
    c_hash: string; // 코드 해시
    auth_time: number; // 인증 시간
    nonce_supported: boolean; // nonce 지원 여부
  },
  state: test,
  user: {
    {
      name: { firstName: string; lastName: string };
      email: string;
    }
  }
}
```

## 주요 기능

### 1. 자동 리다이렉트

사용자가 소셜 로그인 엔드포인트에 접근하면:

- `code` 파라미터가 없으면 해당 소셜 로그인 페이지로 자동 리다이렉트
- `code` 파라미터가 있으면 토큰 교환 및 사용자 정보 조회 후 처리
- 애플 로그인 제외

### 2. 상태값 관리

각 소셜 로그인에서 `state` 파라미터를 통해 CSRF 공격 방지 및 추가 데이터 전달 가능

### 3. 도메인 변환

`domainTransform` 유틸리티를 통해 현재 URL을 적절한 리다이렉트 URI로 변환

### 4. 에러 처리

각 가드에서 발생하는 에러를 적절히 처리하고 로깅

## 보안 고려사항

1. **환경변수 사용**: 민감한 정보는 환경변수로 관리
2. **HTTPS 사용**: 프로덕션 환경에서는 반드시 HTTPS 사용
3. **상태값 검증**: `state` 파라미터를 통한 CSRF 공격 방지
4. **토큰 검증**: Apple 로그인의 경우 JWT 토큰 검증 필수

## 예외 처리

각 가드에서 발생할 수 있는 예외:

- `NotFoundException`: 설정이 누락된 경우
- `InternalServerErrorException`: API 호출 실패 시

## 로깅

각 가드에서 `Logger`를 사용하여 디버깅 정보와 에러 로그를 기록합니다.

## 라이센스

MIT License

# nestjs-social-login
