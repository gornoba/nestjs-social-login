import { DynamicModule, Global, Module } from "@nestjs/common";
import { SocialLoginInterface } from "./types/social-login.type";
import { SOCIAL_LOGIN_CONFIG } from "./social-login.constant";
import { KakaoLoginGuard } from "./guards/kakao-login.guard";
import { GoogleLoginGuard } from "./guards/google-login.guard";
import { AppleLoginGuard } from "./guards/apple-login.guard";
import { NaverLoginGuard } from "./guards/naver-login.guard";

@Global()
@Module({})
export class SocialLoginModule {
  static forRoot(config: SocialLoginInterface): DynamicModule {
    const {
      domain,
      kakaoLoginConfig,
      googleLoginConfig,
      appleLoginConfig,
      naverLoginConfig,
    } = config;

    Reflect.defineMetadata(
      SOCIAL_LOGIN_CONFIG,
      {
        domain,
        kakaoLoginConfig,
        googleLoginConfig,
        appleLoginConfig,
        naverLoginConfig,
      },
      SocialLoginModule
    );

    return {
      module: SocialLoginModule,
      providers: [
        KakaoLoginGuard,
        GoogleLoginGuard,
        AppleLoginGuard,
        NaverLoginGuard,
      ],
      exports: [
        KakaoLoginGuard,
        GoogleLoginGuard,
        AppleLoginGuard,
        NaverLoginGuard,
      ],
    };
  }
}
