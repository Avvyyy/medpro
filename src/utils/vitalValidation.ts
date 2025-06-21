import { VitalRanges, VitalReading, BloodPressureReading } from '../types/vitals';

export const VITAL_RANGES: VitalRanges = {
  heartRate: {
    normal: { min: 60, max: 100 },
    warning: { min: 50, max: 120 },
    critical: { min: 0, max: 200 }
  },
  bloodPressure: {
    systolic: {
      normal: { min: 90, max: 120 },
      warning: { min: 80, max: 140 },
      critical: { min: 60, max: 200 }
    },
    diastolic: {
      normal: { min: 60, max: 80 },
      warning: { min: 50, max: 90 },
      critical: { min: 40, max: 120 }
    }
  },
  temperature: {
    normal: { min: 97.0, max: 99.5 },
    warning: { min: 95.0, max: 101.0 },
    critical: { min: 90.0, max: 110.0 }
  },
  oxygenSaturation: {
    normal: { min: 95, max: 100 },
    warning: { min: 90, max: 94 },
    critical: { min: 70, max: 89 }
  },
  weight: {
    normal: { min: 50, max: 300 },
    warning: { min: 40, max: 400 },
    critical: { min: 30, max: 500 }
  },
  respiratoryRate: {
    normal: { min: 12, max: 20 },
    warning: { min: 10, max: 25 },
    critical: { min: 6, max: 40 }
  }
};

export const validateVitalReading = (
  type: keyof VitalRanges,
  value: number,
  patientAge?: number
): 'normal' | 'warning' | 'critical' => {
  // Age-adjusted ranges for certain vitals
  let ranges = VITAL_RANGES[type];
  
  if (patientAge && type === 'heartRate') {
    if (patientAge < 1) {
      ranges = {
        normal: { min: 100, max: 160 },
        warning: { min: 90, max: 180 },
        critical: { min: 0, max: 220 }
      };
    } else if (patientAge < 12) {
      ranges = {
        normal: { min: 80, max: 120 },
        warning: { min: 70, max: 140 },
        critical: { min: 0, max: 200 }
      };
    } else if (patientAge > 65) {
      ranges = {
        normal: { min: 55, max: 95 },
        warning: { min: 45, max: 110 },
        critical: { min: 0, max: 180 }
      };
    }
  }

  if (value >= ranges.normal.min && value <= ranges.normal.max) {
    return 'normal';
  } else if (value >= ranges.warning.min && value <= ranges.warning.max) {
    return 'warning';
  } else {
    return 'critical';
  }
};

export const validateBloodPressure = (
  systolic: number,
  diastolic: number,
  patientAge?: number
): 'normal' | 'warning' | 'critical' => {
  const systolicStatus = validateVitalReading('bloodPressure', systolic, patientAge);
  const diastolicStatus = validateVitalReading('bloodPressure', diastolic, patientAge);
  
  // Return the more severe status
  if (systolicStatus === 'critical' || diastolicStatus === 'critical') {
    return 'critical';
  } else if (systolicStatus === 'warning' || diastolicStatus === 'warning') {
    return 'warning';
  } else {
    return 'normal';
  }
};

export const formatVitalValue = (type: string, value: number): string => {
  switch (type) {
    case 'heartRate':
      return `${Math.round(value)} BPM`;
    case 'temperature':
      return `${value.toFixed(1)}°F`;
    case 'oxygenSaturation':
      return `${Math.round(value)}%`;
    case 'weight':
      return `${value.toFixed(1)} lbs`;
    case 'respiratoryRate':
      return `${Math.round(value)} /min`;
    default:
      return value.toString();
  }
};

export const formatBloodPressure = (systolic: number, diastolic: number): string => {
  return `${Math.round(systolic)}/${Math.round(diastolic)} mmHg`;
};

export const calculateTrend = (currentValue: number, previousValue: number): 'up' | 'down' | 'stable' => {
  const difference = currentValue - previousValue;
  const percentChange = Math.abs(difference / previousValue) * 100;
  
  if (percentChange < 5) {
    return 'stable';
  } else if (difference > 0) {
    return 'up';
  } else {
    return 'down';
  }
};

export const generateAlerts = (
  vitals: any,
  patientId: string,
  patientAge?: number
): any[] => {
  const alerts: any[] = [];
  
  // Check heart rate
  if (vitals.heartRate) {
    const status = validateVitalReading('heartRate', vitals.heartRate.value, patientAge);
    if (status === 'critical') {
      alerts.push({
        id: `alert-${Date.now()}-hr`,
        type: 'critical',
        message: `Critical heart rate: ${vitals.heartRate.value} BPM`,
        vitalType: 'heartRate',
        threshold: vitals.heartRate.value > 100 ? 100 : 60,
        actualValue: vitals.heartRate.value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    } else if (status === 'warning') {
      alerts.push({
        id: `alert-${Date.now()}-hr`,
        type: 'warning',
        message: `Abnormal heart rate: ${vitals.heartRate.value} BPM`,
        vitalType: 'heartRate',
        threshold: vitals.heartRate.value > 100 ? 100 : 60,
        actualValue: vitals.heartRate.value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }
  }
  
  // Check blood pressure
  if (vitals.bloodPressure) {
    const status = validateBloodPressure(
      vitals.bloodPressure.systolic,
      vitals.bloodPressure.diastolic,
      patientAge
    );
    if (status === 'critical') {
      alerts.push({
        id: `alert-${Date.now()}-bp`,
        type: 'critical',
        message: `Critical blood pressure: ${vitals.bloodPressure.systolic}/${vitals.bloodPressure.diastolic} mmHg`,
        vitalType: 'bloodPressure',
        threshold: 140,
        actualValue: vitals.bloodPressure.systolic,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }
  }
  
  // Check oxygen saturation
  if (vitals.oxygenSaturation) {
    const status = validateVitalReading('oxygenSaturation', vitals.oxygenSaturation.value, patientAge);
    if (status === 'critical') {
      alerts.push({
        id: `alert-${Date.now()}-o2`,
        type: 'critical',
        message: `Critical oxygen saturation: ${vitals.oxygenSaturation.value}%`,
        vitalType: 'oxygenSaturation',
        threshold: 95,
        actualValue: vitals.oxygenSaturation.value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }
  }
  
  // Check temperature
  if (vitals.temperature) {
    const status = validateVitalReading('temperature', vitals.temperature.value, patientAge);
    if (status === 'critical') {
      alerts.push({
        id: `alert-${Date.now()}-temp`,
        type: 'critical',
        message: `Critical temperature: ${vitals.temperature.value}°F`,
        vitalType: 'temperature',
        threshold: vitals.temperature.value > 99.5 ? 99.5 : 97.0,
        actualValue: vitals.temperature.value,
        timestamp: new Date().toISOString(),
        acknowledged: false
      });
    }
  }
  
  return alerts;
};