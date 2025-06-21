export interface VitalSigns {
  id: string;
  patientId: string;
  timestamp: string;
  recordedBy: string;
  source: 'manual' | 'iot' | 'device';
  vitals: {
    heartRate: VitalReading;
    bloodPressure: BloodPressureReading;
    temperature: VitalReading;
    oxygenSaturation: VitalReading;
    weight: VitalReading;
    respiratoryRate?: VitalReading;
  };
  notes?: string;
  alertsTriggered: Alert[];
  createdAt: string;
  updatedAt: string;
}

export interface VitalReading {
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  trend?: 'up' | 'down' | 'stable';
  deviceId?: string;
  accuracy?: number;
}

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical' | 'unknown';
  trend?: 'up' | 'down' | 'stable';
  deviceId?: string;
  accuracy?: number;
}

export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  vitalType: string;
  threshold: number;
  actualValue: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface VitalRanges {
  heartRate: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
  };
  bloodPressure: {
    systolic: {
      normal: { min: number; max: number };
      warning: { min: number; max: number };
      critical: { min: number; max: number };
    };
    diastolic: {
      normal: { min: number; max: number };
      warning: { min: number; max: number };
      critical: { min: number; max: number };
    };
  };
  temperature: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
  };
  oxygenSaturation: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
  };
  weight: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
  };
  respiratoryRate: {
    normal: { min: number; max: number };
    warning: { min: number; max: number };
    critical: { min: number; max: number };
  };
}

export interface IoTDevice {
  id: string;
  name: string;
  type: 'heart_monitor' | 'blood_pressure' | 'thermometer' | 'pulse_oximeter' | 'scale' | 'multi_sensor';
  patientId: string;
  status: 'online' | 'offline' | 'error' | 'maintenance';
  lastReading: string;
  batteryLevel?: number;
  firmwareVersion: string;
  location?: string;
  calibrationDate: string;
  nextMaintenanceDate: string;
}