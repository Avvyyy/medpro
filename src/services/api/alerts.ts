import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { Alert, AlertConfiguration, AlertHistory } from '../../types/database';

export interface AlertSearchParams {
  patientId?: string;
  alertType?: string;
  severity?: string;
  priority?: string;
  isAcknowledged?: boolean;
  isResolved?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateAlertRequest {
  patientId: string;
  alertType: 'automatic' | 'manual' | 'system';
  severity: 'info' | 'warning' | 'critical';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  vitalType?: string;
  vitalValue?: number;
  thresholdValue?: number;
  sourceData?: any;
  expiresAt?: string;
  metadata?: any;
}

export interface UpdateAlertRequest {
  title?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';
  expiresAt?: string;
  metadata?: any;
}

export interface AcknowledgeAlertRequest {
  notes?: string;
}

export interface ResolveAlertRequest {
  resolutionNotes: string;
}

export interface EscalateAlertRequest {
  escalationLevel: number;
  notes?: string;
  assignedTo?: string;
}

export interface AlertConfigurationRequest {
  patientId?: string;
  vitalType: string;
  parameter?: string;
  condition: 'above' | 'below' | 'between' | 'outside';
  thresholdValue: number;
  secondaryThreshold?: number;
  severity: 'info' | 'warning' | 'critical';
  isEnabled: boolean;
  description?: string;
}

export interface AlertSummary {
  total: number;
  byStatus: {
    active: number;
    acknowledged: number;
    resolved: number;
  };
  bySeverity: {
    info: number;
    warning: number;
    critical: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
  };
  recentTrends: {
    period: string;
    count: number;
    change: number;
  }[];
}

class AlertService {
  public async getAlerts(params?: AlertSearchParams): Promise<ApiResponse<Alert[]>> {
    return apiClient.get<Alert[]>(API_ENDPOINTS.ALERTS.BASE, params);
  }

  public async getAlert(id: string): Promise<ApiResponse<Alert>> {
    return apiClient.get<Alert>(`${API_ENDPOINTS.ALERTS.BASE}/${id}`);
  }

  public async createAlert(alertData: CreateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiClient.post<Alert>(API_ENDPOINTS.ALERTS.BASE, alertData);
  }

  public async updateAlert(id: string, updates: UpdateAlertRequest): Promise<ApiResponse<Alert>> {
    return apiClient.patch<Alert>(`${API_ENDPOINTS.ALERTS.BASE}/${id}`, updates);
  }

  public async deleteAlert(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.ALERTS.BASE}/${id}`);
  }

  public async acknowledgeAlert(id: string, request: AcknowledgeAlertRequest): Promise<ApiResponse<Alert>> {
    const endpoint = API_ENDPOINTS.ALERTS.ACKNOWLEDGE.replace(':id', id);
    return apiClient.post<Alert>(endpoint, request);
  }

  public async resolveAlert(id: string, request: ResolveAlertRequest): Promise<ApiResponse<Alert>> {
    const endpoint = API_ENDPOINTS.ALERTS.RESOLVE.replace(':id', id);
    return apiClient.post<Alert>(endpoint, request);
  }

  public async escalateAlert(id: string, request: EscalateAlertRequest): Promise<ApiResponse<Alert>> {
    const endpoint = API_ENDPOINTS.ALERTS.ESCALATE.replace(':id', id);
    return apiClient.post<Alert>(endpoint, request);
  }

  public async getAlertHistory(id: string): Promise<ApiResponse<AlertHistory[]>> {
    const endpoint = API_ENDPOINTS.ALERTS.HISTORY.replace(':id', id);
    return apiClient.get<AlertHistory[]>(endpoint);
  }

  // Alert Configurations
  public async getAlertConfigurations(patientId?: string): Promise<ApiResponse<AlertConfiguration[]>> {
    return apiClient.get<AlertConfiguration[]>(API_ENDPOINTS.ALERTS.CONFIGURATIONS, {
      patientId
    });
  }

  public async createAlertConfiguration(config: AlertConfigurationRequest): Promise<ApiResponse<AlertConfiguration>> {
    return apiClient.post<AlertConfiguration>(API_ENDPOINTS.ALERTS.CONFIGURATIONS, config);
  }

  public async updateAlertConfiguration(id: string, updates: Partial<AlertConfigurationRequest>): Promise<ApiResponse<AlertConfiguration>> {
    return apiClient.patch<AlertConfiguration>(`${API_ENDPOINTS.ALERTS.CONFIGURATIONS}/${id}`, updates);
  }

  public async deleteAlertConfiguration(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.ALERTS.CONFIGURATIONS}/${id}`);
  }

  // Thresholds (alias for configurations)
  public async getThresholds(patientId?: string): Promise<ApiResponse<AlertConfiguration[]>> {
    return this.getAlertConfigurations(patientId);
  }

  public async createThreshold(threshold: AlertConfigurationRequest): Promise<ApiResponse<AlertConfiguration>> {
    return this.createAlertConfiguration(threshold);
  }

  public async updateThreshold(id: string, updates: Partial<AlertConfigurationRequest>): Promise<ApiResponse<AlertConfiguration>> {
    return this.updateAlertConfiguration(id, updates);
  }

  public async deleteThreshold(id: string): Promise<ApiResponse<void>> {
    return this.deleteAlertConfiguration(id);
  }

  // Patient-specific alerts
  public async getPatientAlerts(
    patientId: string,
    params?: Omit<AlertSearchParams, 'patientId'>
  ): Promise<ApiResponse<Alert[]>> {
    const endpoint = API_ENDPOINTS.PATIENTS.ALERTS.replace(':id', patientId);
    return apiClient.get<Alert[]>(endpoint, params);
  }

  public async getAlertSummary(patientId?: string): Promise<ApiResponse<AlertSummary>> {
    return apiClient.get<AlertSummary>(`${API_ENDPOINTS.ALERTS.BASE}/summary`, {
      patientId
    });
  }

  // Bulk operations
  public async bulkAcknowledgeAlerts(alertIds: string[], notes?: string): Promise<ApiResponse<Alert[]>> {
    return apiClient.post<Alert[]>(`${API_ENDPOINTS.ALERTS.BASE}/bulk-acknowledge`, {
      alertIds,
      notes
    });
  }

  public async bulkResolveAlerts(alertIds: string[], resolutionNotes: string): Promise<ApiResponse<Alert[]>> {
    return apiClient.post<Alert[]>(`${API_ENDPOINTS.ALERTS.BASE}/bulk-resolve`, {
      alertIds,
      resolutionNotes
    });
  }
}

export const alertService = new AlertService();