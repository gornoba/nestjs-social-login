import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SocialLoginInterface } from '../types/social-login.type';
import { SOCIAL_LOGIN_CONFIG } from '../social-login.constant';
import { SocialLoginModule } from '../social-login.module';
import { domainTransform } from '../utils/domain-transform.util';
import axios from 'axios';
import { GoogleAuth, GoogleUser } from '../types/google.type';

@Injectable()
export class GoogleLoginGuard implements CanActivate {
  private readonly logger = new Logger(GoogleLoginGuard.name);
  private googleConfig: SocialLoginInterface;

  constructor() {
    this.googleConfig = Reflect.getMetadata(
      SOCIAL_LOGIN_CONFIG,
      SocialLoginModule,
    );
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { googleLoginConfig, domain } = this.googleConfig;

    if (!googleLoginConfig) {
      throw new NotFoundException('Google login config not found');
    }

    const { clientId, state } = googleLoginConfig;
    const { code, state: queryState } = request.query as {
      code: string;
      state: string;
    };

    const url = request.url;
    const redirectUri = domainTransform(domain, url);

    if (!code) {
      const redirectUrl = this.getCodeRedirect(clientId, redirectUri, state);
      response.status(302).redirect(redirectUrl);
      return false;
    }

    const googleAuth = await this.googleCodeVerify(code, redirectUri);
    const googleUser = await this.googleUserInfo(googleAuth.access_token);

    request['googleData'] = {
      googleAuth,
      googleUser,
      state: queryState,
    };

    return true;
  }

  private getCodeRedirect(
    clientId: string,
    redirectUri: string,
    state?: string,
  ) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'email profile',
      ...(state && { state }),
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private async googleCodeVerify(code: string, redirectUri: string) {
    const { googleLoginConfig } = this.googleConfig;

    if (!googleLoginConfig) {
      throw new NotFoundException('Google login config not found');
    }

    const { clientId, clientSecret } = googleLoginConfig;

    try {
      const result = await axios.post(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }),
      );
      return result.data as GoogleAuth;
    } catch (error) {
      this.logger.error(`googleCodeVerify error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }

  private async googleUserInfo(accessToken: string) {
    try {
      const result = await axios.get(
        `https://www.googleapis.com/userinfo/v2/me`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      return result.data as GoogleUser;
    } catch (error) {
      this.logger.error(`googleUserInfo error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }
}
