import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { SocialLoginInterface } from "../types/social-login.type";
import { SOCIAL_LOGIN_CONFIG } from "../social-login.constant";
import { SocialLoginModule } from "../social-login.module";
import { domainTransform } from "../utils/domain-transform.util";
import axios from "axios";
import { NaverAuth, NaverUser } from "../types/naver.type";

@Injectable()
export class NaverLoginGuard implements CanActivate {
  private readonly logger = new Logger(NaverLoginGuard.name);
  private naverConfig: SocialLoginInterface;

  constructor() {
    this.naverConfig = Reflect.getMetadata(
      SOCIAL_LOGIN_CONFIG,
      SocialLoginModule
    );
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { naverLoginConfig, domain } = this.naverConfig;

    if (!naverLoginConfig) {
      throw new NotFoundException("Naver login config not found");
    }

    const { clientId, state } = naverLoginConfig;
    const {
      code,
      state: queryState,
      error,
      error_description,
    } = request.query as {
      code: string;
      state: string;
      error?: string;
      error_description?: string;
    };

    const url = request.url;
    const redirectUri = domainTransform(domain, url);

    if (!code) {
      const redirectUrl = this.getCodeRedirect(
        clientId,
        redirectUri,
        queryState || state
      );
      response.status(302).redirect(redirectUrl);
      return false;
    }

    if (error) {
      this.logger.error(`Naver login error: ${error} ${error_description}`);
      throw new InternalServerErrorException(
        `Naver login error: ${error} ${error_description}`
      );
    }

    const naverAuth = await this.naverCodeVerify(code, state);
    const naverUser = await this.naverUserInfo(naverAuth.access_token);

    request["naverData"] = {
      naverAuth,
      naverUser,
      state: queryState,
    };
    return true;
  }

  private getCodeRedirect(
    clientId: string,
    redirectUri: string,
    state?: string
  ) {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
    });
    return `https://nid.naver.com/oauth2.0/authorize?${params.toString()}`;
  }

  private async naverCodeVerify(code: string, state: string) {
    const { naverLoginConfig } = this.naverConfig;

    if (!naverLoginConfig) {
      throw new NotFoundException("Naver login config not found");
    }

    const { clientId, clientSecret } = naverLoginConfig;

    const result = await axios.post(
      "https://nid.naver.com/oauth2.0/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        client_secret: clientSecret,
        code,
        state,
      })
    );
    const resultData = result.data as NaverAuth;

    if (resultData.error) {
      this.logger.error(
        `Naver login error: ${resultData.error} ${resultData.error_description}`
      );
      throw new InternalServerErrorException(
        `Naver login error: ${resultData.error} ${resultData.error_description}`
      );
    }

    return resultData;
  }

  private async naverUserInfo(accessToken: string) {
    try {
      const result = await axios.get(`https://openapi.naver.com/v1/nid/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return result.data as NaverUser;
    } catch (error) {
      this.logger.error(`Naver user info error: ${error.message}`);
      throw new InternalServerErrorException(error.message);
    }
  }
}
