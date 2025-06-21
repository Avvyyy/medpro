import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { VitalSignsRecord } from '../../types/database';

export interface VitalSignsRequest {
  patientId: string;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
  temperature?: number;
  oxygenSaturation?: number;
  respiratoryRate?: number;
  weight?: number;
  height?: number;
  painLevel?: number;
  notes?: string;
  source?: 'manual' | 'iot' | 'device';
  deviceId?: string;
}

export interface VitalSignsSearchParams {
  patientId?: string;
  startDate?: string;
  endDate?: string;
  vitalType?: string;
  source?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface VitalSignsTrend {
  patientId: string;
  vitalType: string;
  timeframe: '24h' | '7d' | '30d' | '90d';
  data: {
    timestamp: string;
    value: number;
    status: 'normal' | 'warning' | 'critical';
  }[];
  statistics: {
    min: number;
    max: number;
    average: number;
    trend: 'up' | 'down' | 'stable';
    changePercent: number;
  };
}

export interface VitalSignsValidation {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  suggestions: string[];
}

export interface VitalSignsBatch {
  readings: VitalSignsRequest[];
  validateAll?: boolean;
}

export interface VitalSignsExport {
  format: 'csv' | 'pdf' | 'json';
  patientIds?: string[];
  startDate?: string;
  endDate?: string;
  vitalTypes?: string[];
}

class VitalSignsService {
  public async getVitalSigns(params?: VitalSignsSearchParams): Promise<ApiResponse<VitalSignsRecord[]>> {
    return apiClient.get<VitalSignsRecord[]>(API_ENDPOINTS.VITALS.BASE, params);
  }

  public async getVitalSign(id: string): Promise<ApiResponse<VitalSignsRecord>> {
    return apiClient.get<VitalSignsRecord>(`${API_ENDPOINTS.VITALS.BASE}/${id}`);
  }

  public async createVitalSigns(vitalsData: VitalSignsRequest): Promise<ApiResponse<VitalSignsRecord>> {
    return apiClient.post<VitalSignsRecord>(API_ENDPOINTS.VITALS.BASE, vitalsData);
  }

  public async updateVitalSigns(id: string, updates: Partial<VitalSignsRequest>): Promise<ApiResponse<VitalSignsRecord>> {
    return apiClient.patch<VitalSignsRecord>(`${API_ENDPOINTS.VITALS.BASE}/${id}`, updates);
  }

  public async deleteVitalSigns(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.VITALS.BASE}/${id}`);
  }

  public async createBatchVitalSigns(batch: VitalSignsBatch): Promise<ApiResponse<VitalSignsRecord[]>> {
    return apiClient.post<VitalSignsRecord[]>(API_ENDPOINTS.VITALS.BATCH, batch);
  }

  public async getLatestVitalSigns(patientId: string): Promise<ApiResponse<VitalSignsRecord>> {
    return apiClient.get<VitalSignsRecord>(API_ENDPOINTS.VITALS.LATEST, { patientId });
  }

  public async getVitalSignsTrends(
    patientId: string,
    vitalType: string,
    timeframe: '24h' | '7d' | '30d' | '90d'
  ): Promise<ApiResponse<VitalSignsTrend>> {
    return apiClient.get<VitalSignsTrend>(API_ENDPOINTS.VITALS.TRENDS, {
      patientId,
      vitalType,
      timeframe
    });
  }

  public async validateVitalSigns(vitalsData: VitalSignsRequest): Promise<ApiResponse<VitalSignsValidation>> {
    return apiClient.post<VitalSignsValidation>(API_ENDPOINTS.VITALS.VALIDATE, vitalsData);
  }

  public async exportVitalSigns(exportParams: VitalSignsExport): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.post<{ downloadUrl: string }>(API_ENDPOINTS.VITALS.EXPORT, exportParams);
  }

  public async validateVitalSign(id: string, validatedBy: string): Promise<ApiResponse<VitalSignsRecord>> {
    return apiClient.patch<VitalSignsRecord>(`${API_ENDPOINTS.VITALS.BASE}/${id}/validate`, {
      validatedBy
    });
  }

  // Patient-specific vital signs
  public async getPatientVitalSigns(
    patientId: string,
    params?: Omit<VitalSignsSearchParams, 'patientId'>
  ): Promise<ApiResponse<VitalSignsRecord[]>> {
    const endpoint = API_ENDPOINTS.PATIENTS.VITALS.replace(':id', patientId);
    return apiClient.get<VitalSignsRecord[]>(endpoint, params);
  }

  public async getPatientLatestVitals(patientId: string): Promise<ApiResponse<VitalSignsRecord>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.VITALS.replace(':id', patientId)}/latest`;
    return apiClient.get<VitalSignsRecord>(endpoint);
  }

  public async getPatientVitalsTrends(
    patientId: string,
    vitalType: string,
    timeframe: string
  ): Promise<ApiResponse<VitalSignsTrend>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.VITALS.replace(':id', patientId)}/trends`;
    return apiClient.get<VitalSignsTrend>(endpoint, { vitalType, timeframe });
  }
}

export const vitalSignsService = new VitalSignsService();