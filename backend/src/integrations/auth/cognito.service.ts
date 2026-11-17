import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { env } from '../../config/env.js';

export interface CognitoUserClaim {
  sub: string;
  email: string;
  role: 'CUSTOMER' | 'OWNER' | 'ADMIN';
  verified: boolean;
}

export class CognitoAuthService {
  private client: CognitoIdentityProviderClient | null = null;
  private userPoolId: string;
  private clientId: string;

  constructor() {
    this.userPoolId = process.env.AWS_COGNITO_USER_POOL_ID || '';
    this.clientId = process.env.AWS_COGNITO_CLIENT_ID || '';

    if (this.userPoolId) {
      this.client = new CognitoIdentityProviderClient({
        region: env.AWS_REGION || 'ap-south-1',
      });
      console.log(`[CognitoAuthService] Initialized with User Pool: ${this.userPoolId}`);
    } else {
      console.log('[CognitoAuthService] Running in local JWT verification mode (Cognito credentials not configured)');
    }
  }

  public isEnabled(): boolean {
    return Boolean(this.client && this.userPoolId);
  }

  public async verifyAccessToken(accessToken: string): Promise<CognitoUserClaim | null> {
    if (!this.client) return null;

    try {
      const command = new GetUserCommand({
        AccessToken: accessToken,
      });

      const response = await this.client.send(command);
      if (!response.Username) return null;

      const attrs: Record<string, string> = {};
      (response.UserAttributes || []).forEach((a) => {
        if (a.Name && a.Value) attrs[a.Name] = a.Value;
      });

      return {
        sub: attrs['sub'] || response.Username,
        email: attrs['email'] || `${response.Username}@cognito.borrowbuy.in`,
        role: (attrs['custom:role'] as any) || 'CUSTOMER',
        verified: attrs['email_verified'] === 'true',
      };
    } catch (err: any) {
      console.warn(`[CognitoAuthService] Token validation failed: ${err.message}`);
      return null;
    }
  }
}

export const cognitoAuthService = new CognitoAuthService();
