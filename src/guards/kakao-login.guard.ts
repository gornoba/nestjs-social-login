import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SocialLoginInterface } from '../types/social-login.type';
import { SocialLoginModule } from '../social-login.module';
import { SOCIAL_LOGIN_CONFIG } from '../social-login.constant';
import { domainTransform } from '../utils/domain-transform.util';
import axios from 'axios';
import { KakaoAuth, KakaoUser } from '../types/kakao.type';

@Injectable()
export class KakaoLoginGuard implements CanActivate {
  private readonly logger = new Logger(KakaoLoginGuard.name);
  private kakaoConfig: SocialLoginInterface;

  constructor() {
    this.kakaoConfig = Reflect.getMetadata(
      SOCIAL_LOGIN_CONFIG,
      SocialLoginModule,
    );
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { kakaoLoginConfig, domain } = this.kakaoConfig;

    if (!kakaoLoginConfig) {
      throw new NotFoundException('Kakao login config not found');
    }

    const { restApiKey, scope, state } = kakaoLoginConfig;
    const { code, state: queryState } = request.query as {
      code: string;
      state: string;
    };

    const url = request.url;
    const redirectUri = domainTransform(domain, url);

    if (!code) {
      const redirectUrl = this.getCodeRedirect(
        restApiKey,
        redirectUri,
        scope,
        state,
      );
      response.status(302).redirect(redirectUrl);
      return false;
    }

    const kakaoAuth = await this.kakaoCodeVerify(code, redirectUri);
    const kakaoUser = await this.kakaoUserInfo(kakaoAuth.access_token);

    request['kakaoData'] = {
      kakaoAuth,
      kakaoUser,
      state: queryState,
    };

    return true;
  }

  private getCodeRedirect(
    restApiKey: string,
    redirectUri: string,
    scope?: string,
    state?: string,
  ) {
    const params = new URLSearchParams({
      client_id: restApiKey,
      redirect_uri: redirectUri,
      response_type: 'code',
      ...(scope && { scope }),
      ...(state && { state }),
    });
    return `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  }

  private async kakaoCodeVerify(code: string, redirectUri: string) {
    const { kakaoLoginConfig } = this.kakaoConfig;

    if (!kakaoLoginConfig) {
      throw new NotFoundException('Kakao login config not found');
    }

    const { restApiKey, secretKey } = kakaoLoginConfig;

    try {
      const result = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: restApiKey,
          redirect_uri: redirectUri,
          code,
          ...(secretKey && { client_secret: secretKey }),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return result.data as KakaoAuth;
    } catch (error) {
      this.logger.error(`kakaoCodeVerify error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async kakaoUserInfo(accessToken: string) {
    try {
      const result = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return result.data as KakaoUser;
    } catch (error) {
      this.logger.error(`kakaoUserInfo error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }
}
