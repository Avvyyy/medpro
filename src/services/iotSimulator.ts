import { VitalSigns, IoTDevice, VitalReading, BloodPressureReading } from '../types/vitals';
import { validateVitalReading, validateBloodPressure, calculateTrend, generateAlerts } from '../utils/vitalValidation';

export class IoTSimulator {
  private devices: IoTDevice[] = [];
  private isRunning = false;
  private intervals: NodeJS.Timeout[] = [];
  private onDataCallback?: (data: VitalSigns) => void;
  private historicalData: Map<string, VitalSigns[]> = new Map();

  constructor() {
    this.initializeDevices();
  }

  private initializeDevices() {
    this.devices = [
      {
        id: 'device-001',
        name: 'CardioMonitor Pro',
        type: 'heart_monitor',
        patientId: 'P001',
        status: 'online',
        lastReading: new Date().toISOString(),
        batteryLevel: 85,
        firmwareVersion: '2.1.4',
        location: 'Room 101',
        calibrationDate: '2024-01-01',
        nextMaintenanceDate: '2024-06-01'
      },
      {
        id: 'device-002',
        name: 'BP Monitor Elite',
        type: 'blood_pressure',
        patientId: 'P001',
        status: 'online',
        lastReading: new Date().toISOString(),
        batteryLevel: 92,
        firmwareVersion: '1.8.2',
        location: 'Room 101',
        calibrationDate: '2024-01-01',
        nextMaintenanceDate: '2024-06-01'
      },
      {
        id: 'device-003',
        name: 'TempSense Digital',
        type: 'thermometer',
        patientId: 'P002',
        status: 'online',
        lastReading: new Date().toISOString(),
        batteryLevel: 78,
        firmwareVersion: '3.0.1',
        location: 'Room 102',
        calibrationDate: '2024-01-01',
        nextMaintenanceDate: '2024-06-01'
      },
      {
        id: 'device-004',
        name: 'OxyPulse Monitor',
        type: 'pulse_oximeter',
        patientId: 'P003',
        status: 'online',
        lastReading: new Date().toISOString(),
        batteryLevel: 65,
        firmwareVersion: '2.5.0',
        location: 'Room 103',
        calibrationDate: '2024-01-01',
        nextMaintenanceDate: '2024-06-01'
      },
      {
        id: 'device-005',
        name: 'SmartScale Pro',
        type: 'scale',
        patientId: 'P004',
        status: 'online',
        lastReading: new Date().toISOString(),
        batteryLevel: 88,
        firmwareVersion: '1.4.7',
        location: 'Room 104',
        calibrationDate: '2024-01-01',
        nextMaintenanceDate: '2024-06-01'
      }
    ];
  }

  public startSimulation(onDataReceived: (data: VitalSigns) => void) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.onDataCallback = onDataReceived;
    
    // Generate data for each device at different intervals
    this.devices.forEach(device => {
      const interval = setInterval(() => {
        this.generateDeviceData(device);
      }, this.getDeviceInterval(device.type));
      
      this.intervals.push(interval);
    });
    
    console.log('IoT Simulation started');
  }

  public stopSimulation() {
    this.isRunning = false;
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    console.log('IoT Simulation stopped');
  }

  private getDeviceInterval(deviceType: string): number {
    switch (deviceType) {
      case 'heart_monitor':
        return 30000; // 30 seconds
      case 'blood_pressure':
        return 300000; // 5 minutes
      case 'thermometer':
        return 120000; // 2 minutes
      case 'pulse_oximeter':
        return 60000; // 1 minute
      case 'scale':
        return 86400000; // 24 hours
      default:
        return 60000; // 1 minute
    }
  }

  private generateDeviceData(device: IoTDevice) {
    const patientHistory = this.historicalData.get(device.patientId) || [];
    const lastReading = patientHistory[patientHistory.length - 1];
    
    let vitals: any = {};
    
    switch (device.type) {
      case 'heart_monitor':
        vitals.heartRate = this.generateHeartRate(lastReading?.vitals.heartRate, device.patientId);
        break;
      case 'blood_pressure':
        vitals.bloodPressure = this.generateBloodPressure(lastReading?.vitals.bloodPressure, device.patientId);
        break;
      case 'thermometer':
        vitals.temperature = this.generateTemperature(lastReading?.vitals.temperature, device.patientId);
        break;
      case 'pulse_oximeter':
        vitals.oxygenSaturation = this.generateOxygenSaturation(lastReading?.vitals.oxygenSaturation, device.patientId);
        vitals.heartRate = this.generateHeartRate(lastReading?.vitals.heartRate, device.patientId);
        break;
      case 'scale':
        vitals.weight = this.generateWeight(lastReading?.vitals.weight, device.patientId);
        break;
    }

    const vitalSigns: VitalSigns = {
      id: `reading-${Date.now()}-${device.id}`,
      patientId: device.patientId,
      timestamp: new Date().toISOString(),
      recordedBy: 'IoT System',
      source: 'iot',
      vitals,
      alertsTriggered: generateAlerts(vitals, device.patientId),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store historical data
    if (!this.historicalData.has(device.patientId)) {
      this.historicalData.set(device.patientId, []);
    }
    this.historicalData.get(device.patientId)!.push(vitalSigns);

    // Keep only last 100 readings per patient
    const history = this.historicalData.get(device.patientId)!;
    if (history.length > 100) {
      history.splice(0, history.length - 100);
    }

    // Update device status
    device.lastReading = new Date().toISOString();
    device.batteryLevel = Math.max(0, (device.batteryLevel || 100) - Math.random() * 0.1);

    if (this.onDataCallback) {
      this.onDataCallback(vitalSigns);
    }
  }

  private generateHeartRate(lastReading?: VitalReading, patientId?: string): VitalReading {
    let baseValue = 75;
    
    // Patient-specific baselines
    if (patientId === 'P001') baseValue = 85; // Sarah Johnson (critical patient)
    if (patientId === 'P002') baseValue = 72;
    if (patientId === 'P003') baseValue = 68;
    if (patientId === 'P004') baseValue = 70;

    const variation = (Math.random() - 0.5) * 20;
    const trend = lastReading ? (Math.random() - 0.5) * 5 : 0;
    const value = Math.max(40, Math.min(180, baseValue + variation + trend));

    // Simulate critical condition for P001
    const finalValue = patientId === 'P001' && Math.random() < 0.3 
      ? Math.max(120, value + Math.random() * 30) 
      : value;

    return {
      value: Math.round(finalValue),
      unit: 'BPM',
      status: validateVitalReading('heartRate', finalValue),
      trend: lastReading ? calculateTrend(finalValue, lastReading.value) : 'stable',
      deviceId: 'device-001',
      accuracy: 95 + Math.random() * 5
    };
  }

  private generateBloodPressure(lastReading?: BloodPressureReading, patientId?: string): BloodPressureReading {
    let baseSystolic = 120;
    let baseDiastolic = 80;
    
    // Patient-specific baselines
    if (patientId === 'P001') {
      baseSystolic = 140;
      baseDiastolic = 90;
    }

    const systolicVariation = (Math.random() - 0.5) * 30;
    const diastolicVariation = (Math.random() - 0.5) * 20;
    
    const systolic = Math.max(80, Math.min(200, baseSystolic + systolicVariation));
    const diastolic = Math.max(50, Math.min(120, baseDiastolic + diastolicVariation));

    // Simulate critical condition for P001
    const finalSystolic = patientId === 'P001' && Math.random() < 0.3 
      ? Math.max(160, systolic + Math.random() * 40) 
      : systolic;

    return {
      systolic: Math.round(finalSystolic),
      diastolic: Math.round(diastolic),
      unit: 'mmHg',
      status: validateBloodPressure(finalSystolic, diastolic),
      trend: lastReading ? calculateTrend(finalSystolic, lastReading.systolic) : 'stable',
      deviceId: 'device-002',
      accuracy: 92 + Math.random() * 8
    };
  }

  private generateTemperature(lastReading?: VitalReading, patientId?: string): VitalReading {
    let baseValue = 98.6;
    
    const variation = (Math.random() - 0.5) * 2;
    const value = Math.max(95, Math.min(105, baseValue + variation));

    // Simulate fever for some patients occasionally
    const finalValue = Math.random() < 0.1 
      ? Math.max(100, value + Math.random() * 3) 
      : value;

    return {
      value: Math.round(finalValue * 10) / 10,
      unit: '°F',
      status: validateVitalReading('temperature', finalValue),
      trend: lastReading ? calculateTrend(finalValue, lastReading.value) : 'stable',
      deviceId: 'device-003',
      accuracy: 98 + Math.random() * 2
    };
  }

  private generateOxygenSaturation(lastReading?: VitalReading, patientId?: string): VitalReading {
    let baseValue = 98;
    
    // Patient-specific baselines
    if (patientId === 'P004') baseValue = 95; // Robert Davis (COPD)

    const variation = (Math.random() - 0.5) * 4;
    const value = Math.max(85, Math.min(100, baseValue + variation));

    // Simulate low oxygen for COPD patient
    const finalValue = patientId === 'P004' && Math.random() < 0.2 
      ? Math.max(88, value - Math.random() * 8) 
      : value;

    return {
      value: Math.round(finalValue),
      unit: '%',
      status: validateVitalReading('oxygenSaturation', finalValue),
      trend: lastReading ? calculateTrend(finalValue, lastReading.value) : 'stable',
      deviceId: 'device-004',
      accuracy: 96 + Math.random() * 4
    };
  }

  private generateWeight(lastReading?: VitalReading, patientId?: string): VitalReading {
    let baseValue = 150;
    
    // Patient-specific baselines
    if (patientId === 'P001') baseValue = 140; // Sarah Johnson
    if (patientId === 'P002') baseValue = 175; // Michael Chen
    if (patientId === 'P003') baseValue = 130; // Emma Rodriguez
    if (patientId === 'P004') baseValue = 180; // Robert Davis

    const variation = (Math.random() - 0.5) * 2; // Small daily variation
    const value = Math.max(80, Math.min(400, baseValue + variation));

    return {
      value: Math.round(value * 10) / 10,
      unit: 'lbs',
      status: validateVitalReading('weight', value),
      trend: lastReading ? calculateTrend(value, lastReading.value) : 'stable',
      deviceId: 'device-005',
      accuracy: 99 + Math.random() * 1
    };
  }

  public getDevices(): IoTDevice[] {
    return [...this.devices];
  }

  public getDevicesByPatient(patientId: string): IoTDevice[] {
    return this.devices.filter(device => device.patientId === patientId);
  }

  public getHistoricalData(patientId: string, limit?: number): VitalSigns[] {
    const data = this.historicalData.get(patientId) || [];
    return limit ? data.slice(-limit) : data;
  }

  public updateDeviceStatus(deviceId: string, status: IoTDevice['status']) {
    const device = this.devices.find(d => d.id === deviceId);
    if (device) {
      device.status = status;
    }
  }

  public isSimulationRunning(): boolean {
    return this.isRunning;
  }
}

// Singleton instance
export const iotSimulator = new IoTSimulator();