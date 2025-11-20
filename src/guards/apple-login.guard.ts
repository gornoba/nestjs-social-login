import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { SOCIAL_LOGIN_CONFIG } from "../social-login.constant";
import { SocialLoginModule } from "../social-login.module";
import {
  AppleLoginConfig,
  SocialLoginInterface,
} from "../types/social-login.type";
import { domainTransform } from "../utils/domain-transform.util";
import axios from "axios";
import { ApplePublicKey, AppleToken } from "../types/apple.type";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

@Injectable()
export class AppleLoginGuard implements CanActivate {
  private readonly logger = new Logger(AppleLoginGuard.name);
  private appleConfig: SocialLoginInterface;

  constructor() {
    this.appleConfig = Reflect.getMetadata(
      SOCIAL_LOGIN_CONFIG,
      SocialLoginModule
    );
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { appleLoginConfig, domain } = this.appleConfig;

    if (!appleLoginConfig) {
      throw new NotFoundException("Apple login config not found");
    }

    const { clientId, state, testDomain } = appleLoginConfig;
    const body = request.body;

    const url = request.url;
    const redirectUri = domainTransform(testDomain || domain, url);

    if (!body?.code) {
      const redirectUrl = this.getCodeRedirect(
        clientId,
        redirectUri,
        body?.state || state
      );
      response.send(redirectUrl);
      return false;
    }

    const verifiedCode = await this.appleCodeVerify(
      body.id_token,
      appleLoginConfig
    );

    request["appleData"] = {
      appleAuth: verifiedCode,
      user: this.isJson(body?.user) ? JSON.parse(body?.user) : body?.user,
      state: body?.state,
    };

    return true;
  }

  private isJson(str: string) {
    if (!str) return false;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  private getCodeRedirect(
    clientId: string,
    redirectUri: string,
    state?: string
  ) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code id_token",
      scope: "email name openid",
      response_mode: "form_post",
      ...(state && { state }),
    });
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  private async appleCodeVerify(code: string, appleConfig: AppleLoginConfig) {
    const publicKeys = await this.getApplePublicKey();

    // Apple Key 중 정합한 키 찾기
    const decodedHeader = jwt.decode(code, { complete: true });
    const key = publicKeys.find((key) => key.kid === decodedHeader.header.kid);

    if (!key) {
      throw new NotFoundException("Unable to find matching Apple public key");
    }

    // 공개키 생성
    const pem = jwkToPem(key);

    // JWT 검증
    const verifiedToken = jwt.verify(code, pem, {
      algorithms: [key.alg],
      audience: appleConfig.clientId,
      issuer: "https://appleid.apple.com",
    }) as AppleToken;

    return verifiedToken;
  }

  private async getApplePublicKey(): Promise<ApplePublicKey[]> {
    const result = await axios.get("https://appleid.apple.com/auth/keys");
    return result.data.keys;
  }
  1;
}
