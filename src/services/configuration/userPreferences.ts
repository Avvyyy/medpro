// User preferences and customization service

export interface UserPreferences {
  id: string;
  userId: string;
  dashboard: {
    layout: 'grid' | 'list' | 'compact';
    refreshInterval: number;
    defaultView: 'overview' | 'patients' | 'alerts' | 'vitals';
    showWelcomeMessage: boolean;
    compactMode: boolean;
  };
  notifications: {
    email: {
      enabled: boolean;
      alerts: boolean;
      reports: boolean;
      systemUpdates: boolean;
    };
    push: {
      enabled: boolean;
      alerts: boolean;
      reminders: boolean;
    };
    inApp: {
      enabled: boolean;
      sound: boolean;
      desktop: boolean;
    };
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  display: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    colorBlindMode: boolean;
    highContrast: boolean;
    animations: boolean;
  };
  data: {
    itemsPerPage: number;
    defaultDateRange: '24h' | '7d' | '30d' | '90d';
    autoSave: boolean;
    confirmDelete: boolean;
  };
  privacy: {
    shareUsageData: boolean;
    allowAnalytics: boolean;
    sessionTimeout: number;
  };
  accessibility: {
    screenReader: boolean;
    keyboardNavigation: boolean;
    focusIndicators: boolean;
    reducedMotion: boolean;
  };
  shortcuts: {
    [key: string]: string;
  };
  customFields: {
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PreferenceUpdate {
  category: keyof Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
  updates: any;
}

class UserPreferencesService {
  private preferences: Map<string, UserPreferences> = new Map();

  // Get user preferences
  public getUserPreferences(userId: string): UserPreferences {
    let prefs = this.preferences.get(userId);
    
    if (!prefs) {
      prefs = this.createDefaultPreferences(userId);
      this.preferences.set(userId, prefs);
    }
    
    return prefs;
  }

  // Update user preferences
  public updatePreferences(userId: string, updates: PreferenceUpdate[]): {
    success: boolean;
    errors: string[];
  } {
    const prefs = this.getUserPreferences(userId);
    const errors: string[] = [];

    try {
      const updatedPrefs = { ...prefs };

      updates.forEach(update => {
        if (update.category in updatedPrefs) {
          updatedPrefs[update.category] = {
            ...updatedPrefs[update.category],
            ...update.updates
          };
        } else {
          errors.push(`Invalid preference category: ${update.category}`);
        }
      });

      if (errors.length === 0) {
        updatedPrefs.updatedAt = new Date().toISOString();
        this.preferences.set(userId, updatedPrefs);
      }

      return { success: errors.length === 0, errors };
    } catch (error) {
      return { success: false, errors: ['Failed to update preferences'] };
    }
  }

  // Reset preferences to default
  public resetToDefault(userId: string, categories?: string[]): boolean {
    try {
      const defaultPrefs = this.createDefaultPreferences(userId);
      
      if (categories && categories.length > 0) {
        const currentPrefs = this.getUserPreferences(userId);
        categories.forEach(category => {
          if (category in defaultPrefs) {
            (currentPrefs as any)[category] = (defaultPrefs as any)[category];
          }
        });
        currentPrefs.updatedAt = new Date().toISOString();
        this.preferences.set(userId, currentPrefs);
      } else {
        this.preferences.set(userId, defaultPrefs);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  // Get specific preference value
  public getPreference<T>(userId: string, path: string): T | null {
    const prefs = this.getUserPreferences(userId);
    const keys = path.split('.');
    
    let value: any = prefs;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    
    return value;
  }

  // Set specific preference value
  public setPreference(userId: string, path: string, value: any): boolean {
    try {
      const prefs = this.getUserPreferences(userId);
      const keys = path.split('.');
      const lastKey = keys.pop();
      
      if (!lastKey) return false;
      
      let target: any = prefs;
      for (const key of keys) {
        if (!(key in target)) {
          target[key] = {};
        }
        target = target[key];
      }
      
      target[lastKey] = value;
      prefs.updatedAt = new Date().toISOString();
      this.preferences.set(userId, prefs);
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Export preferences
  public exportPreferences(userId: string): string {
    const prefs = this.getUserPreferences(userId);
    return JSON.stringify(prefs, null, 2);
  }

  // Import preferences
  public importPreferences(userId: string, preferencesData: string): {
    success: boolean;
    errors: string[];
  } {
    try {
      const importedPrefs: UserPreferences = JSON.parse(preferencesData);
      
      // Validate structure
      const validation = this.validatePreferences(importedPrefs);
      if (!validation.isValid) {
        return { success: false, errors: validation.errors };
      }

      // Update user ID and timestamps
      importedPrefs.userId = userId;
      importedPrefs.updatedAt = new Date().toISOString();
      
      this.preferences.set(userId, importedPrefs);
      return { success: true, errors: [] };
    } catch (error) {
      return { success: false, errors: ['Invalid preferences format'] };
    }
  }

  // Get theme preferences for UI
  public getThemePreferences(userId: string): {
    theme: string;
    fontSize: string;
    colorBlindMode: boolean;
    highContrast: boolean;
    animations: boolean;
    reducedMotion: boolean;
  } {
    const prefs = this.getUserPreferences(userId);
    return {
      theme: prefs.display.theme,
      fontSize: prefs.display.fontSize,
      colorBlindMode: prefs.display.colorBlindMode,
      highContrast: prefs.display.highContrast,
      animations: prefs.display.animations,
      reducedMotion: prefs.accessibility.reducedMotion
    };
  }

  // Get notification preferences
  public getNotificationPreferences(userId: string): UserPreferences['notifications'] {
    const prefs = this.getUserPreferences(userId);
    return prefs.notifications;
  }

  // Check if user should receive notification
  public shouldReceiveNotification(
    userId: string,
    type: 'email' | 'push' | 'inApp',
    category: 'alerts' | 'reports' | 'reminders' | 'systemUpdates'
  ): boolean {
    const prefs = this.getUserPreferences(userId);
    const notificationPrefs = prefs.notifications[type];
    
    if (!notificationPrefs.enabled) return false;
    
    if (category in notificationPrefs) {
      return (notificationPrefs as any)[category];
    }
    
    return false;
  }

  private createDefaultPreferences(userId: string): UserPreferences {
    return {
      id: this.generateId(),
      userId,
      dashboard: {
        layout: 'grid',
        refreshInterval: 30000, // 30 seconds
        defaultView: 'overview',
        showWelcomeMessage: true,
        compactMode: false
      },
      notifications: {
        email: {
          enabled: true,
          alerts: true,
          reports: true,
          systemUpdates: false
        },
        push: {
          enabled: true,
          alerts: true,
          reminders: true
        },
        inApp: {
          enabled: true,
          sound: true,
          desktop: true
        },
        frequency: 'immediate'
      },
      display: {
        theme: 'light',
        fontSize: 'medium',
        colorBlindMode: false,
        highContrast: false,
        animations: true
      },
      data: {
        itemsPerPage: 25,
        defaultDateRange: '7d',
        autoSave: true,
        confirmDelete: true
      },
      privacy: {
        shareUsageData: false,
        allowAnalytics: true,
        sessionTimeout: 28800000 // 8 hours
      },
      accessibility: {
        screenReader: false,
        keyboardNavigation: true,
        focusIndicators: true,
        reducedMotion: false
      },
      shortcuts: {
        'ctrl+shift+d': 'dashboard',
        'ctrl+shift+p': 'patients',
        'ctrl+shift+a': 'alerts',
        'ctrl+shift+v': 'vitals'
      },
      customFields: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private validatePreferences(prefs: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!prefs.userId) errors.push('User ID is required');
    if (!prefs.dashboard) errors.push('Dashboard preferences are required');
    if (!prefs.notifications) errors.push('Notification preferences are required');
    if (!prefs.display) errors.push('Display preferences are required');

    // Validate specific values
    if (prefs.display?.theme && !['light', 'dark', 'auto'].includes(prefs.display.theme)) {
      errors.push('Invalid theme value');
    }

    if (prefs.display?.fontSize && !['small', 'medium', 'large'].includes(prefs.display.fontSize)) {
      errors.push('Invalid font size value');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private generateId(): string {
    return `pref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const userPreferences = new UserPreferencesService();