import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SOCIAL_LOGIN_CONFIG } from '../social-login.constant';
import { SocialLoginModule } from '../social-login.module';
import {
  AppleLoginConfig,
  SocialLoginInterface,
} from '../types/social-login.type';
import { domainTransform } from '../utils/domain-transform.util';
import axios from 'axios';
import { ApplePublicKey, AppleToken } from '../types/apple.type';
import jwt from 'jsonwebtoken';
import jwkToPem from 'jwk-to-pem';

@Injectable()
export class AppleLoginGuard implements CanActivate {
  private readonly logger = new Logger(AppleLoginGuard.name);
  private appleConfig: SocialLoginInterface;

  constructor() {
    this.appleConfig = Reflect.getMetadata(
      SOCIAL_LOGIN_CONFIG,
      SocialLoginModule,
    );
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { appleLoginConfig, domain } = this.appleConfig;

    if (!appleLoginConfig) {
      throw new NotFoundException('Apple login config not found');
    }

    const { clientId, clientSecret, state } = appleLoginConfig;
    const {
      code,
      id_token,
      user,
      state: queryState,
    } = request.body as {
      code: string;
      state: string;
      id_token: string;
      user: string;
    };

    const url = request.url;
    const redirectUri = domainTransform(domain, url);

    if (!code) {
      const redirectUrl = this.getCodeRedirect(clientId, redirectUri, state);
      response.status(302).redirect(redirectUrl);
      return false;
    }

    const verifiedCode = await this.appleCodeVerify(code, appleLoginConfig);

    request['appleData'] = {
      appleAuth: verifiedCode,
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
      response_type: 'code id_token',
      scope: 'openid email name',
      response_mode: 'form_post',
      ...(state
        ? { state }
        : { state: Math.random().toString(36).substring(2, 15) }),
      nonce: Math.random().toString(36).substring(2, 15),
    });
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  private async appleCodeVerify(code: string, appleConfig: AppleLoginConfig) {
    const publicKeys = await this.getApplePublicKey();

    // Apple Key 중 정합한 키 찾기
    const decodedHeader = jwt.decode(code, { complete: true });
    const key = publicKeys.find((key) => key.kid === decodedHeader.header.kid);

    if (!key) {
      throw new NotFoundException('Unable to find matching Apple public key');
    }

    // 공개키 생성
    const pem = jwkToPem(key);

    // JWT 검증
    const verifiedToken = jwt.verify(code, pem, {
      algorithms: [key.alg],
      audience: appleConfig.clientId,
      issuer: appleConfig.issuer,
    }) as AppleToken;

    return verifiedToken;
  }

  private async getApplePublicKey(): Promise<ApplePublicKey[]> {
    const result = await axios.get('https://appleid.apple.com/auth/keys');
    return result.data.keys;
  }
  1;
}
