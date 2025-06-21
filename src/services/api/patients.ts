import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { Patient, MedicalHistory, EmergencyContact, Insurance } from '../../types/database';

export interface PatientSearchParams {
  query?: string;
  status?: string;
  assignedDoctorId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreatePatientRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  medicalRecordNumber?: string;
  assignedDoctorId: string;
  roomNumber?: string;
}

export interface UpdatePatientRequest extends Partial<CreatePatientRequest> {
  status?: 'active' | 'inactive' | 'critical' | 'discharged';
}

export interface PatientListResponse {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class PatientService {
  public async getPatients(params?: PatientSearchParams): Promise<ApiResponse<PatientListResponse>> {
    return apiClient.get<PatientListResponse>(API_ENDPOINTS.PATIENTS.BASE, params);
  }

  public async getPatient(id: string): Promise<ApiResponse<Patient>> {
    return apiClient.get<Patient>(`${API_ENDPOINTS.PATIENTS.BASE}/${id}`);
  }

  public async createPatient(patientData: CreatePatientRequest): Promise<ApiResponse<Patient>> {
    return apiClient.post<Patient>(API_ENDPOINTS.PATIENTS.BASE, patientData);
  }

  public async updatePatient(id: string, updates: UpdatePatientRequest): Promise<ApiResponse<Patient>> {
    return apiClient.patch<Patient>(`${API_ENDPOINTS.PATIENTS.BASE}/${id}`, updates);
  }

  public async deletePatient(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${API_ENDPOINTS.PATIENTS.BASE}/${id}`);
  }

  public async searchPatients(query: string): Promise<ApiResponse<Patient[]>> {
    return apiClient.get<Patient[]>(API_ENDPOINTS.PATIENTS.SEARCH, { q: query });
  }

  // Medical History
  public async getMedicalHistory(patientId: string): Promise<ApiResponse<MedicalHistory[]>> {
    const endpoint = API_ENDPOINTS.PATIENTS.MEDICAL_HISTORY.replace(':id', patientId);
    return apiClient.get<MedicalHistory[]>(endpoint);
  }

  public async addMedicalHistory(patientId: string, history: Omit<MedicalHistory, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<MedicalHistory>> {
    const endpoint = API_ENDPOINTS.PATIENTS.MEDICAL_HISTORY.replace(':id', patientId);
    return apiClient.post<MedicalHistory>(endpoint, history);
  }

  public async updateMedicalHistory(patientId: string, historyId: string, updates: Partial<MedicalHistory>): Promise<ApiResponse<MedicalHistory>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.MEDICAL_HISTORY.replace(':id', patientId)}/${historyId}`;
    return apiClient.patch<MedicalHistory>(endpoint, updates);
  }

  public async deleteMedicalHistory(patientId: string, historyId: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.MEDICAL_HISTORY.replace(':id', patientId)}/${historyId}`;
    return apiClient.delete<void>(endpoint);
  }

  // Emergency Contacts
  public async getEmergencyContacts(patientId: string): Promise<ApiResponse<EmergencyContact[]>> {
    const endpoint = API_ENDPOINTS.PATIENTS.EMERGENCY_CONTACTS.replace(':id', patientId);
    return apiClient.get<EmergencyContact[]>(endpoint);
  }

  public async addEmergencyContact(patientId: string, contact: Omit<EmergencyContact, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<EmergencyContact>> {
    const endpoint = API_ENDPOINTS.PATIENTS.EMERGENCY_CONTACTS.replace(':id', patientId);
    return apiClient.post<EmergencyContact>(endpoint, contact);
  }

  public async updateEmergencyContact(patientId: string, contactId: string, updates: Partial<EmergencyContact>): Promise<ApiResponse<EmergencyContact>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.EMERGENCY_CONTACTS.replace(':id', patientId)}/${contactId}`;
    return apiClient.patch<EmergencyContact>(endpoint, updates);
  }

  public async deleteEmergencyContact(patientId: string, contactId: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.EMERGENCY_CONTACTS.replace(':id', patientId)}/${contactId}`;
    return apiClient.delete<void>(endpoint);
  }

  // Insurance
  public async getInsurance(patientId: string): Promise<ApiResponse<Insurance[]>> {
    const endpoint = API_ENDPOINTS.PATIENTS.INSURANCE.replace(':id', patientId);
    return apiClient.get<Insurance[]>(endpoint);
  }

  public async addInsurance(patientId: string, insurance: Omit<Insurance, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Insurance>> {
    const endpoint = API_ENDPOINTS.PATIENTS.INSURANCE.replace(':id', patientId);
    return apiClient.post<Insurance>(endpoint, insurance);
  }

  public async updateInsurance(patientId: string, insuranceId: string, updates: Partial<Insurance>): Promise<ApiResponse<Insurance>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.INSURANCE.replace(':id', patientId)}/${insuranceId}`;
    return apiClient.patch<Insurance>(endpoint, updates);
  }

  public async deleteInsurance(patientId: string, insuranceId: string): Promise<ApiResponse<void>> {
    const endpoint = `${API_ENDPOINTS.PATIENTS.INSURANCE.replace(':id', patientId)}/${insuranceId}`;
    return apiClient.delete<void>(endpoint);
  }
}

export const patientService = new PatientService();