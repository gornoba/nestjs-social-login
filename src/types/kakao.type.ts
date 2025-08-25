export interface KakaoRequest {
  restApiKey: string;
  secretKey: string;
  redirectUri: string;
}

export class KakaoAccount {
  profile_needs_agreement?: boolean; //	사용자 동의 시 프로필 정보(닉네임/프로필 사진) 제공 가능
  profile_nickname_needs_agreement?: boolean; //	사용자 동의 시 닉네임 제공 가능
  profile_image_needs_agreement?: boolean; //	사용자 동의 시 프로필 사진 제공 가능
  profile?: KakaoProfile; // 	프로필 정보
  name_needs_agreement?: boolean; //	사용자 동의 시 카카오계정 이름 제공 가능
  name?: string; //	카카오계정 이름
  email_needs_agreement?: boolean; //	사용자 동의 시 카카오계정 대표 이메일 제공 가능
  is_email_valid?: boolean; //	이메일 유효 여부 true: 유효한 이메일 false: 이메일이 다른 카카오계정에 사용돼 만료
  is_email_verified?: boolean; //	이메일 인증 여부 true: 인증된 이메일 false: 인증되지 않은 이메일
  email?: string; //	카카오계정 대표 이메일
  age_range_needs_agreement?: boolean; //	사용자 동의 시 연령대 제공 가능
  age_range?:
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
  birthyear_needs_agrement?: boolean; //	사용자 동의 시 출생 연도 제공 가능
  birthyear?: string; //	출생 연도(YYYY 형식)
  birthday_needs_agreement?: boolean; //	사용자 동의 시 생일 제공 가능
  birthday?: string; //	생일(MMDD 형식)
  birthday_type?: 'SOLAR' | 'LUNAR'; //	생일 타입 SOLAR(양력) 또는 LUNAR음력)
  gender_needs_agreement?: boolean; //	사용자 동의 시 성별 제공 가능
  gender?: 'female' | 'mail'; //	성별 female: 여 male: 남성
  phone_number_needs_agreement?: boolean; //	사용자 동의 시 전화번호 제공 가능
  phone_number?: string; //	카카오계정의 전화번호 국내 번호인 경우 +82 0-0000-0000 형식 해외 번호인 경우 자릿수, 붙임표(-) 유무나 위치가 다를 수 있음 (참고: libphonenumber)
  ci_needs_agreement?: boolean; //	사용자 동의 시 CI 참고 가능
  ci?: string; //	연계정보 ci_authenticated_at	Datetime	CI 발급 시각, UTC*
}

export class KakaoUser {
  id: number;
  has_signed_up?: boolean;
  connected_at?: string;
  synched_at?: string;
  properties?: string;
  kakao_account?: KakaoAccount;
  for_partner?: string;
}

export class KakaoProfile {
  nickname?: string; // 닉네임
  thumbnail_image_url?: string; //	프로필 미리보기 이미지 URL
  profile_image_url?: string; //	프로필 사진 URL
  is_default_image?: boolean; //	프로필 사진 URL이 기본 프로필 사진 URL인지 여부
  is_default_nickname?: boolean; // 닉네임이 기본 닉네임인지 여부
}

export class KakaoAuth {
  access_token: string;
  token_type: string;
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

export class KakaoToken {
  expiresInMillis: number;
  id: number;
  expires_in: number;
  app_id: number;
  appId: number;
}
