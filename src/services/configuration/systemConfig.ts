// System configuration management service

export interface SystemConfiguration {
  id: string;
  category: 'alert' | 'security' | 'system' | 'ui' | 'integration';
  key: string;
  value: any;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isEditable: boolean;
  requiresRestart: boolean;
  validationRules?: {
    min?: number;
    max?: number;
    pattern?: string;
    allowedValues?: any[];
  };
  createdAt: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ConfigurationUpdate {
  key: string;
  value: any;
  updatedBy: string;
}

class SystemConfigurationService {
  private configurations: Map<string, SystemConfiguration> = new Map();

  constructor() {
    this.initializeDefaultConfigurations();
  }

  private initializeDefaultConfigurations(): void {
    const defaultConfigs: Omit<SystemConfiguration, 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>[] = [
      // Alert Configurations
      {
        category: 'alert',
        key: 'alert.default_timeout',
        value: 3600000, // 1 hour in milliseconds
        dataType: 'number',
        description: 'Default timeout for alerts in milliseconds',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 60000, max: 86400000 } // 1 minute to 24 hours
      },
      {
        category: 'alert',
        key: 'alert.escalation_enabled',
        value: true,
        dataType: 'boolean',
        description: 'Enable automatic alert escalation',
        isEditable: true,
        requiresRestart: false
      },
      {
        category: 'alert',
        key: 'alert.escalation_delay',
        value: 900000, // 15 minutes
        dataType: 'number',
        description: 'Delay before escalating unacknowledged alerts (milliseconds)',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 300000, max: 3600000 } // 5 minutes to 1 hour
      },
      {
        category: 'alert',
        key: 'alert.max_escalation_level',
        value: 3,
        dataType: 'number',
        description: 'Maximum escalation level for alerts',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 1, max: 5 }
      },

      // Security Configurations
      {
        category: 'security',
        key: 'security.session_timeout',
        value: 28800000, // 8 hours
        dataType: 'number',
        description: 'User session timeout in milliseconds',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 900000, max: 86400000 } // 15 minutes to 24 hours
      },
      {
        category: 'security',
        key: 'security.password_min_length',
        value: 8,
        dataType: 'number',
        description: 'Minimum password length',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 6, max: 20 }
      },
      {
        category: 'security',
        key: 'security.require_mfa',
        value: false,
        dataType: 'boolean',
        description: 'Require multi-factor authentication',
        isEditable: true,
        requiresRestart: false
      },
      {
        category: 'security',
        key: 'security.audit_retention_days',
        value: 2555, // 7 years for HIPAA compliance
        dataType: 'number',
        description: 'Number of days to retain audit logs',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 365, max: 3650 } // 1 to 10 years
      },

      // System Configurations
      {
        category: 'system',
        key: 'system.data_retention_days',
        value: 2555, // 7 years
        dataType: 'number',
        description: 'Number of days to retain patient data',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 365, max: 3650 }
      },
      {
        category: 'system',
        key: 'system.backup_frequency_hours',
        value: 24,
        dataType: 'number',
        description: 'Frequency of automatic backups in hours',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 1, max: 168 } // 1 hour to 1 week
      },
      {
        category: 'system',
        key: 'system.max_file_upload_size',
        value: 10485760, // 10MB
        dataType: 'number',
        description: 'Maximum file upload size in bytes',
        isEditable: true,
        requiresRestart: true,
        validationRules: { min: 1048576, max: 104857600 } // 1MB to 100MB
      },
      {
        category: 'system',
        key: 'system.timezone',
        value: 'America/New_York',
        dataType: 'string',
        description: 'System timezone',
        isEditable: true,
        requiresRestart: false,
        validationRules: {
          allowedValues: [
            'America/New_York', 'America/Chicago', 'America/Denver',
            'America/Los_Angeles', 'UTC', 'Europe/London'
          ]
        }
      },

      // UI Configurations
      {
        category: 'ui',
        key: 'ui.default_theme',
        value: 'light',
        dataType: 'string',
        description: 'Default UI theme',
        isEditable: true,
        requiresRestart: false,
        validationRules: { allowedValues: ['light', 'dark', 'auto'] }
      },
      {
        category: 'ui',
        key: 'ui.items_per_page',
        value: 25,
        dataType: 'number',
        description: 'Default number of items per page',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 10, max: 100 }
      },
      {
        category: 'ui',
        key: 'ui.auto_refresh_interval',
        value: 30000, // 30 seconds
        dataType: 'number',
        description: 'Auto-refresh interval for dashboards (milliseconds)',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 5000, max: 300000 } // 5 seconds to 5 minutes
      },

      // Integration Configurations
      {
        category: 'integration',
        key: 'integration.iot_data_interval',
        value: 30000, // 30 seconds
        dataType: 'number',
        description: 'IoT data collection interval (milliseconds)',
        isEditable: true,
        requiresRestart: false,
        validationRules: { min: 5000, max: 300000 }
      },
      {
        category: 'integration',
        key: 'integration.api_rate_limit',
        value: 1000,
        dataType: 'number',
        description: 'API rate limit (requests per hour)',
        isEditable: true,
        requiresRestart: true,
        validationRules: { min: 100, max: 10000 }
      }
    ];

    defaultConfigs.forEach(config => {
      const fullConfig: SystemConfiguration = {
        ...config,
        id: this.generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedBy: 'system'
      };
      this.configurations.set(config.key, fullConfig);
    });
  }

  // Get configuration value by key
  public getConfig<T = any>(key: string): T | null {
    const config = this.configurations.get(key);
    return config ? config.value : null;
  }

  // Get all configurations
  public getAllConfigurations(): SystemConfiguration[] {
    return Array.from(this.configurations.values());
  }

  // Get configurations by category
  public getConfigurationsByCategory(category: string): SystemConfiguration[] {
    return Array.from(this.configurations.values())
      .filter(config => config.category === category);
  }

  // Update configuration
  public updateConfiguration(update: ConfigurationUpdate): {
    success: boolean;
    error?: string;
    requiresRestart?: boolean;
  } {
    const config = this.configurations.get(update.key);
    
    if (!config) {
      return { success: false, error: 'Configuration not found' };
    }

    if (!config.isEditable) {
      return { success: false, error: 'Configuration is not editable' };
    }

    // Validate the new value
    const validation = this.validateConfigValue(config, update.value);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Update the configuration
    const updatedConfig: SystemConfiguration = {
      ...config,
      value: update.value,
      updatedAt: new Date().toISOString(),
      updatedBy: update.updatedBy
    };

    this.configurations.set(update.key, updatedConfig);

    return {
      success: true,
      requiresRestart: config.requiresRestart
    };
  }

  // Validate configuration value
  private validateConfigValue(config: SystemConfiguration, value: any): {
    isValid: boolean;
    error?: string;
  } {
    // Type validation
    if (config.dataType === 'number' && typeof value !== 'number') {
      return { isValid: false, error: 'Value must be a number' };
    }
    if (config.dataType === 'boolean' && typeof value !== 'boolean') {
      return { isValid: false, error: 'Value must be a boolean' };
    }
    if (config.dataType === 'string' && typeof value !== 'string') {
      return { isValid: false, error: 'Value must be a string' };
    }

    // Validation rules
    if (config.validationRules) {
      const rules = config.validationRules;

      if (typeof value === 'number') {
        if (rules.min !== undefined && value < rules.min) {
          return { isValid: false, error: `Value must be at least ${rules.min}` };
        }
        if (rules.max !== undefined && value > rules.max) {
          return { isValid: false, error: `Value must not exceed ${rules.max}` };
        }
      }

      if (typeof value === 'string' && rules.pattern) {
        const regex = new RegExp(rules.pattern);
        if (!regex.test(value)) {
          return { isValid: false, error: 'Value does not match required pattern' };
        }
      }

      if (rules.allowedValues && !rules.allowedValues.includes(value)) {
        return { isValid: false, error: `Value must be one of: ${rules.allowedValues.join(', ')}` };
      }
    }

    return { isValid: true };
  }

  // Reset configuration to default
  public resetToDefault(key: string, updatedBy: string): boolean {
    const config = this.configurations.get(key);
    if (!config || !config.isEditable) {
      return false;
    }

    // This would typically reload from default values
    // For now, we'll just mark it as reset
    const resetConfig: SystemConfiguration = {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy
    };

    this.configurations.set(key, resetConfig);
    return true;
  }

  // Export configurations
  public exportConfigurations(): string {
    const configs = this.getAllConfigurations();
    return JSON.stringify(configs, null, 2);
  }

  // Import configurations
  public importConfigurations(configData: string, updatedBy: string): {
    success: boolean;
    imported: number;
    errors: string[];
  } {
    const errors: string[] = [];
    let imported = 0;

    try {
      const configs: SystemConfiguration[] = JSON.parse(configData);

      configs.forEach(config => {
        if (this.configurations.has(config.key)) {
          const updateResult = this.updateConfiguration({
            key: config.key,
            value: config.value,
            updatedBy
          });

          if (updateResult.success) {
            imported++;
          } else {
            errors.push(`${config.key}: ${updateResult.error}`);
          }
        } else {
          errors.push(`${config.key}: Configuration not found`);
        }
      });

      return { success: true, imported, errors };
    } catch (error) {
      return { success: false, imported: 0, errors: ['Invalid JSON format'] };
    }
  }

  private generateId(): string {
    return `config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const systemConfig = new SystemConfigurationService();