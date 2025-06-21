export interface AlertThreshold {
  id: string;
  patientId?: string; // If null, applies to all patients
  vitalType: 'heartRate' | 'bloodPressure' | 'temperature' | 'oxygenSaturation' | 'weight' | 'respiratoryRate';
  parameter?: 'systolic' | 'diastolic'; // For blood pressure
  condition: 'above' | 'below' | 'between' | 'outside';
  value: number;
  secondaryValue?: number; // For 'between' and 'outside' conditions
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  description?: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'critical' | 'warning' | 'info' | 'manual';
  title: string;
  message: string;
  vitalType?: string;
  vitalValue?: number;
  threshold?: number;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  priority: 'high' | 'medium' | 'low';
  source: 'automatic' | 'manual' | 'system';
  metadata?: {
    deviceId?: string;
    location?: string;
    additionalInfo?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AlertHistory {
  id: string;
  alertId: string;
  action: 'created' | 'acknowledged' | 'resolved' | 'escalated' | 'updated';
  performedBy: string;
  timestamp: string;
  notes?: string;
  previousState?: any;
  newState?: any;
}

export interface AlertConfiguration {
  id: string;
  name: string;
  description: string;
  thresholds: AlertThreshold[];
  escalationRules: {
    timeToEscalate: number; // minutes
    escalateTo: string[];
    maxEscalations: number;
  };
  notificationMethods: ('email' | 'sms' | 'push' | 'dashboard')[];
  activeHours: {
    start: string;
    end: string;
    timezone: string;
  };
  enabled: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}