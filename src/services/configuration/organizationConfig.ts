// Organization/tenant configuration management

export interface Organization {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'practice' | 'health_system';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  settings: {
    timezone: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    currency: string;
    language: string;
  };
  features: {
    iotIntegration: boolean;
    advancedAnalytics: boolean;
    multiTenant: boolean;
    customBranding: boolean;
    apiAccess: boolean;
  };
  branding: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
  compliance: {
    hipaaEnabled: boolean;
    auditRetentionDays: number;
    dataEncryption: boolean;
    accessLogging: boolean;
  };
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise';
    maxUsers: number;
    maxPatients: number;
    expiresAt: string;
    features: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationUpdate {
  name?: string;
  address?: Partial<Organization['address']>;
  contact?: Partial<Organization['contact']>;
  settings?: Partial<Organization['settings']>;
  features?: Partial<Organization['features']>;
  branding?: Partial<Organization['branding']>;
  compliance?: Partial<Organization['compliance']>;
}

class OrganizationConfigurationService {
  private organizations: Map<string, Organization> = new Map();
  private currentOrganizationId: string | null = null;

  constructor() {
    this.initializeDemoOrganization();
  }

  private initializeDemoOrganization(): void {
    const demoOrg: Organization = {
      id: 'org_demo_001',
      name: 'Metropolitan General Hospital',
      type: 'hospital',
      address: {
        street: '123 Healthcare Blvd',
        city: 'Medical City',
        state: 'CA',
        zipCode: '90210',
        country: 'United States'
      },
      contact: {
        phone: '+1 (555) 123-4567',
        email: 'admin@metrogeneralhospital.com',
        website: 'https://metrogeneralhospital.com'
      },
      settings: {
        timezone: 'America/Los_Angeles',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        currency: 'USD',
        language: 'en'
      },
      features: {
        iotIntegration: true,
        advancedAnalytics: true,
        multiTenant: false,
        customBranding: true,
        apiAccess: true
      },
      branding: {
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        accentColor: '#10b981'
      },
      compliance: {
        hipaaEnabled: true,
        auditRetentionDays: 2555, // 7 years
        dataEncryption: true,
        accessLogging: true
      },
      subscription: {
        plan: 'enterprise',
        maxUsers: 500,
        maxPatients: 10000,
        expiresAt: '2025-12-31T23:59:59Z',
        features: [
          'unlimited_patients',
          'advanced_analytics',
          'custom_branding',
          'api_access',
          'priority_support'
        ]
      },
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: new Date().toISOString()
    };

    this.organizations.set(demoOrg.id, demoOrg);
    this.currentOrganizationId = demoOrg.id;
  }

  // Get current organization
  public getCurrentOrganization(): Organization | null {
    if (!this.currentOrganizationId) return null;
    return this.organizations.get(this.currentOrganizationId) || null;
  }

  // Set current organization
  public setCurrentOrganization(organizationId: string): boolean {
    if (this.organizations.has(organizationId)) {
      this.currentOrganizationId = organizationId;
      return true;
    }
    return false;
  }

  // Get organization by ID
  public getOrganization(id: string): Organization | null {
    return this.organizations.get(id) || null;
  }

  // Get all organizations
  public getAllOrganizations(): Organization[] {
    return Array.from(this.organizations.values());
  }

  // Update organization
  public updateOrganization(id: string, updates: OrganizationUpdate): {
    success: boolean;
    error?: string;
  } {
    const org = this.organizations.get(id);
    if (!org) {
      return { success: false, error: 'Organization not found' };
    }

    const updatedOrg: Organization = {
      ...org,
      ...updates,
      address: { ...org.address, ...updates.address },
      contact: { ...org.contact, ...updates.contact },
      settings: { ...org.settings, ...updates.settings },
      features: { ...org.features, ...updates.features },
      branding: { ...org.branding, ...updates.branding },
      compliance: { ...org.compliance, ...updates.compliance },
      updatedAt: new Date().toISOString()
    };

    this.organizations.set(id, updatedOrg);
    return { success: true };
  }

  // Create new organization
  public createOrganization(orgData: Omit<Organization, 'id' | 'createdAt' | 'updatedAt'>): Organization {
    const newOrg: Organization = {
      ...orgData,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.organizations.set(newOrg.id, newOrg);
    return newOrg;
  }

  // Check feature availability
  public hasFeature(feature: keyof Organization['features']): boolean {
    const org = this.getCurrentOrganization();
    return org ? org.features[feature] : false;
  }

  // Check subscription limits
  public checkSubscriptionLimits(): {
    users: { current: number; max: number; exceeded: boolean };
    patients: { current: number; max: number; exceeded: boolean };
    planFeatures: string[];
  } {
    const org = this.getCurrentOrganization();
    if (!org) {
      return {
        users: { current: 0, max: 0, exceeded: true },
        patients: { current: 0, max: 0, exceeded: true },
        planFeatures: []
      };
    }

    // In a real implementation, these would be fetched from the database
    const currentUsers = 25; // Mock data
    const currentPatients = 150; // Mock data

    return {
      users: {
        current: currentUsers,
        max: org.subscription.maxUsers,
        exceeded: currentUsers >= org.subscription.maxUsers
      },
      patients: {
        current: currentPatients,
        max: org.subscription.maxPatients,
        exceeded: currentPatients >= org.subscription.maxPatients
      },
      planFeatures: org.subscription.features
    };
  }

  // Get organization settings for UI
  public getUISettings(): {
    theme: {
      primaryColor: string;
      secondaryColor: string;
      accentColor: string;
    };
    locale: {
      timezone: string;
      dateFormat: string;
      timeFormat: string;
      language: string;
    };
    branding: {
      logo?: string;
      organizationName: string;
    };
  } {
    const org = this.getCurrentOrganization();
    if (!org) {
      return {
        theme: {
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          accentColor: '#10b981'
        },
        locale: {
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          language: 'en'
        },
        branding: {
          organizationName: 'Healthcare System'
        }
      };
    }

    return {
      theme: {
        primaryColor: org.branding.primaryColor,
        secondaryColor: org.branding.secondaryColor,
        accentColor: org.branding.accentColor
      },
      locale: {
        timezone: org.settings.timezone,
        dateFormat: org.settings.dateFormat,
        timeFormat: org.settings.timeFormat,
        language: org.settings.language
      },
      branding: {
        logo: org.branding.logo,
        organizationName: org.name
      }
    };
  }

  // Validate organization configuration
  public validateConfiguration(config: Partial<Organization>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (config.name && config.name.length < 2) {
      errors.push('Organization name must be at least 2 characters');
    }

    if (config.contact?.email && !this.isValidEmail(config.contact.email)) {
      errors.push('Invalid email address');
    }

    if (config.contact?.phone && !this.isValidPhone(config.contact.phone)) {
      errors.push('Invalid phone number');
    }

    if (config.subscription?.maxUsers && config.subscription.maxUsers < 1) {
      errors.push('Maximum users must be at least 1');
    }

    if (config.subscription?.maxPatients && config.subscription.maxPatients < 1) {
      errors.push('Maximum patients must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private generateId(): string {
    return `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const organizationConfig = new OrganizationConfigurationService();