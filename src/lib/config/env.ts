/**
 * DOXO Environment & Configuration Manager
 * Provides strict environment separation, config validation, secrets protection,
 * and feature flags for staged rollouts.
 */

export type AppEnvironment = 'development' | 'staging' | 'production';

export interface AppConfig {
  env: AppEnvironment;
  appName: string;
  appVersion: string;
  minSupportedVersion: string;
  maintenanceMode: boolean;
  currency: {
    code: string;
    symbol: string;
    minorUnitFactor: number; // 100 for GEL (1 GEL = 100 tetri)
  };
  features: {
    enableLivePayments: boolean;
    enableRealMaps: boolean;
    enablePushNotifications: boolean;
    enableAiControlledTools: boolean;
    enableRateLimiting: boolean;
    enableStrictStateTransitions: boolean;
  };
  limits: {
    maxPhotoUploadSizeBytes: number; // 10MB
    maxChatAttachmentSizeBytes: number; // 5MB
    aiQueryRateLimitPerMin: number;
    authAttemptsRateLimitPerMin: number;
  };
}

class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: AppConfig;

  private constructor() {
    // Detect environment from Vite env if available, defaulting to development
    const isProd = import.meta.env?.PROD ?? false;
    const mode = (import.meta.env?.MODE || (isProd ? 'production' : 'development')) as AppEnvironment;

    this.config = {
      env: mode,
      appName: 'DOXO Life Operator',
      appVersion: '2.5.0',
      minSupportedVersion: '2.0.0',
      maintenanceMode: false,
      currency: {
        code: 'GEL',
        symbol: '₾',
        minorUnitFactor: 100,
      },
      features: {
        enableLivePayments: true,
        enableRealMaps: true,
        enablePushNotifications: true,
        enableAiControlledTools: true,
        enableRateLimiting: true,
        enableStrictStateTransitions: true,
      },
      limits: {
        maxPhotoUploadSizeBytes: 10 * 1024 * 1024, // 10 MB
        maxChatAttachmentSizeBytes: 5 * 1024 * 1024, // 5 MB
        aiQueryRateLimitPerMin: 30,
        authAttemptsRateLimitPerMin: 5,
      },
    };

    this.validateConfiguration();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  public getConfig(): Readonly<AppConfig> {
    return Object.freeze({ ...this.config });
  }

  public isFeatureEnabled(featureKey: keyof AppConfig['features']): boolean {
    return !!this.config.features[featureKey];
  }

  public setFeatureFlag(featureKey: keyof AppConfig['features'], enabled: boolean): void {
    this.config.features[featureKey] = enabled;
  }

  /**
   * Validate essential configurations without leaking any potential secrets
   */
  private validateConfiguration(): void {
    if (this.config.limits.maxPhotoUploadSizeBytes <= 0) {
      console.warn('[Config Warning] maxPhotoUploadSizeBytes must be greater than 0. Resetting to 10MB default.');
      this.config.limits.maxPhotoUploadSizeBytes = 10 * 1024 * 1024;
    }
    if (this.config.currency.minorUnitFactor !== 100) {
      console.warn('[Config Warning] minorUnitFactor for GEL should be 100.');
    }
  }

  /**
   * Sanitize an object or string to avoid logging secrets, private credentials, or PII
   */
  public maskSensitiveData(input: any): any {
    if (typeof input !== 'object' || input === null) return input;
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cardNumber', 'cvv'];
    const cloned = Array.isArray(input) ? [...input] : { ...input };

    for (const key of Object.keys(cloned)) {
      if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
        cloned[key] = '********';
      } else if (typeof cloned[key] === 'object') {
        cloned[key] = this.maskSensitiveData(cloned[key]);
      }
    }
    return cloned;
  }
}

export const AppEnv = EnvironmentManager.getInstance();
