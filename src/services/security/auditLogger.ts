// Audit logging service for HIPAA compliance

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: string;
  action: string;
  resourceType: string;
  resourceId: string;
  patientId?: string;
  ipAddress: string;
  userAgent: string;
  sessionId?: string;
  timestamp: string;
  success: boolean;
  errorMessage?: string;
  metadata?: any;
  dataAccessed?: string[];
  dataModified?: {
    field: string;
    oldValue?: any;
    newValue?: any;
  }[];
}

export interface AuditSearchParams {
  userId?: string;
  action?: string;
  resourceType?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  success?: boolean;
  page?: number;
  limit?: number;
}

class AuditLogger {
  private logs: AuditLogEntry[] = [];
  private readonly maxLocalLogs = 1000;

  // Log user actions for audit trail
  public async logAction(params: {
    action: string;
    resourceType: string;
    resourceId: string;
    patientId?: string;
    success: boolean;
    errorMessage?: string;
    metadata?: any;
    dataAccessed?: string[];
    dataModified?: {
      field: string;
      oldValue?: any;
      newValue?: any;
    }[];
  }): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      console.warn('Cannot log audit entry: No authenticated user');
      return;
    }

    const entry: AuditLogEntry = {
      id: this.generateId(),
      userId: user.id,
      userRole: user.role,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      patientId: params.patientId,
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      success: params.success,
      errorMessage: params.errorMessage,
      metadata: params.metadata,
      dataAccessed: params.dataAccessed,
      dataModified: params.dataModified
    };

    // Store locally
    this.logs.unshift(entry);
    if (this.logs.length > this.maxLocalLogs) {
      this.logs = this.logs.slice(0, this.maxLocalLogs);
    }

    // In production, send to secure audit log service
    await this.sendToAuditService(entry);

    console.log('Audit log entry created:', entry);
  }

  // Log data access
  public async logDataAccess(
    resourceType: string,
    resourceId: string,
    dataFields: string[],
    patientId?: string
  ): Promise<void> {
    await this.logAction({
      action: 'DATA_ACCESS',
      resourceType,
      resourceId,
      patientId,
      success: true,
      dataAccessed: dataFields
    });
  }

  // Log data modification
  public async logDataModification(
    resourceType: string,
    resourceId: string,
    changes: { field: string; oldValue?: any; newValue?: any }[],
    patientId?: string
  ): Promise<void> {
    await this.logAction({
      action: 'DATA_MODIFICATION',
      resourceType,
      resourceId,
      patientId,
      success: true,
      dataModified: changes
    });
  }

  // Log authentication events
  public async logAuthentication(action: 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED', userId?: string): Promise<void> {
    const user = this.getCurrentUser();
    
    await this.logAction({
      action: `AUTH_${action}`,
      resourceType: 'USER',
      resourceId: userId || user?.id || 'unknown',
      success: action !== 'LOGIN_FAILED',
      errorMessage: action === 'LOGIN_FAILED' ? 'Authentication failed' : undefined
    });
  }

  // Log alert actions
  public async logAlertAction(
    action: 'CREATED' | 'ACKNOWLEDGED' | 'RESOLVED',
    alertId: string,
    patientId: string
  ): Promise<void> {
    await this.logAction({
      action: `ALERT_${action}`,
      resourceType: 'ALERT',
      resourceId: alertId,
      patientId,
      success: true
    });
  }

  // Log vital signs access
  public async logVitalSignsAccess(patientId: string, vitalTypes: string[]): Promise<void> {
    await this.logDataAccess('VITAL_SIGNS', patientId, vitalTypes, patientId);
  }

  // Log patient record access
  public async logPatientAccess(patientId: string, sections: string[]): Promise<void> {
    await this.logDataAccess('PATIENT', patientId, sections, patientId);
  }

  // Get audit logs with filtering
  public getAuditLogs(params: AuditSearchParams = {}): AuditLogEntry[] {
    let filtered = [...this.logs];

    if (params.userId) {
      filtered = filtered.filter(log => log.userId === params.userId);
    }

    if (params.action) {
      filtered = filtered.filter(log => log.action.includes(params.action!));
    }

    if (params.resourceType) {
      filtered = filtered.filter(log => log.resourceType === params.resourceType);
    }

    if (params.patientId) {
      filtered = filtered.filter(log => log.patientId === params.patientId);
    }

    if (params.success !== undefined) {
      filtered = filtered.filter(log => log.success === params.success);
    }

    if (params.startDate) {
      filtered = filtered.filter(log => log.timestamp >= params.startDate!);
    }

    if (params.endDate) {
      filtered = filtered.filter(log => log.timestamp <= params.endDate!);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const page = params.page || 1;
    const limit = params.limit || 50;
    const start = (page - 1) * limit;
    const end = start + limit;

    return filtered.slice(start, end);
  }

  // Generate compliance report
  public generateComplianceReport(startDate: string, endDate: string): {
    summary: {
      totalActions: number;
      successfulActions: number;
      failedActions: number;
      uniqueUsers: number;
      patientsAccessed: number;
    };
    actionBreakdown: Record<string, number>;
    userActivity: Record<string, number>;
    patientAccess: Record<string, number>;
  } {
    const logs = this.getAuditLogs({ startDate, endDate, limit: 10000 });

    const summary = {
      totalActions: logs.length,
      successfulActions: logs.filter(log => log.success).length,
      failedActions: logs.filter(log => !log.success).length,
      uniqueUsers: new Set(logs.map(log => log.userId)).size,
      patientsAccessed: new Set(logs.filter(log => log.patientId).map(log => log.patientId)).size
    };

    const actionBreakdown: Record<string, number> = {};
    const userActivity: Record<string, number> = {};
    const patientAccess: Record<string, number> = {};

    logs.forEach(log => {
      // Action breakdown
      actionBreakdown[log.action] = (actionBreakdown[log.action] || 0) + 1;

      // User activity
      userActivity[log.userId] = (userActivity[log.userId] || 0) + 1;

      // Patient access
      if (log.patientId) {
        patientAccess[log.patientId] = (patientAccess[log.patientId] || 0) + 1;
      }
    });

    return {
      summary,
      actionBreakdown,
      userActivity,
      patientAccess
    };
  }

  private getCurrentUser(): { id: string; role: string } | null {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  private getSessionId(): string | undefined {
    return localStorage.getItem('sessionId') || undefined;
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, this would be handled by the backend
      return 'client-ip-hidden';
    } catch (error) {
      return 'unknown';
    }
  }

  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToAuditService(entry: AuditLogEntry): Promise<void> {
    try {
      // In production, send to secure audit logging service
      // Examples: AWS CloudTrail, Azure Monitor, Splunk, etc.
      
      // For demo purposes, we'll just log to console
      if (process.env.NODE_ENV === 'development') {
        console.log('Audit entry would be sent to secure service:', entry);
      }
    } catch (error) {
      console.error('Failed to send audit log to service:', error);
    }
  }
}

export const auditLogger = new AuditLogger();