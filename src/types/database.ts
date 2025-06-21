// Database schema types for the healthcare monitoring system

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'doctor' | 'nurse' | 'admin' | 'patient';
  first_name: string;
  last_name: string;
  phone?: string;
  license_number?: string;
  specialization?: string;
  department?: string;
  hospital_id?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  avatar_url?: string;
  bio?: string;
  years_experience?: number;
  certifications?: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  preferences: {
    notifications: boolean;
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  email?: string;
  phone?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  emergency_contacts: EmergencyContact[];
  medical_record_number: string;
  assigned_doctor_id: string;
  status: 'active' | 'inactive' | 'critical' | 'discharged';
  admission_date?: string;
  discharge_date?: string;
  room_number?: string;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  patient_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalHistory {
  id: string;
  patient_id: string;
  type: 'condition' | 'medication' | 'allergy' | 'surgery' | 'family_history';
  name: string;
  description?: string;
  severity?: 'mild' | 'moderate' | 'severe';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Insurance {
  id: string;
  patient_id: string;
  provider: string;
  policy_number: string;
  group_number?: string;
  subscriber_name: string;
  relationship_to_patient: string;
  effective_date: string;
  expiration_date?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface VitalSignsRecord {
  id: string;
  patient_id: string;
  recorded_by: string;
  recorded_at: string;
  source: 'manual' | 'iot' | 'device';
  device_id?: string;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  temperature?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  pain_level?: number;
  notes?: string;
  is_validated: boolean;
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VitalSignsMetadata {
  id: string;
  vital_signs_id: string;
  vital_type: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  accuracy?: number;
  confidence_level?: number;
  flags?: string[];
  created_at: string;
}

export interface AlertConfiguration {
  id: string;
  patient_id?: string; // null for global thresholds
  vital_type: string;
  parameter?: string;
  condition: 'above' | 'below' | 'between' | 'outside';
  threshold_value: number;
  secondary_threshold?: number;
  severity: 'info' | 'warning' | 'critical';
  is_enabled: boolean;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  alert_type: 'automatic' | 'manual' | 'system';
  severity: 'info' | 'warning' | 'critical';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  vital_type?: string;
  vital_value?: number;
  threshold_value?: number;
  source_data?: any;
  is_acknowledged: boolean;
  acknowledged_by?: string;
  acknowledged_at?: string;
  is_resolved: boolean;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  escalation_level: number;
  escalated_at?: string;
  expires_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  action: 'created' | 'acknowledged' | 'resolved' | 'escalated' | 'updated' | 'expired';
  performed_by: string;
  previous_state?: any;
  new_state?: any;
  notes?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  old_values?: any;
  new_values?: any;
  ip_address: string;
  user_agent: string;
  session_id?: string;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  token: string;
  refresh_token?: string;
  expires_at: string;
  is_active: boolean;
  ip_address: string;
  user_agent: string;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  license_number: string;
  accreditation?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  name: string;
  type: string;
  model: string;
  manufacturer: string;
  serial_number: string;
  firmware_version: string;
  patient_id?: string;
  room_number?: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  battery_level?: number;
  last_reading_at?: string;
  calibration_date: string;
  next_maintenance_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}