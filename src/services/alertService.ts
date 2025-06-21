import { Alert, AlertThreshold, AlertHistory, AlertConfiguration } from '../types/alerts';
import { VitalSigns } from '../types/vitals';

export class AlertService {
  private alerts: Alert[] = [];
  private thresholds: AlertThreshold[] = [];
  private alertHistory: AlertHistory[] = [];
  private configurations: AlertConfiguration[] = [];
  private listeners: ((alert: Alert) => void)[] = [];

  constructor() {
    this.initializeDefaultThresholds();
    this.loadDemoAlerts();
  }

  private initializeDefaultThresholds() {
    const defaultThresholds: AlertThreshold[] = [
      // Heart Rate Thresholds
      {
        id: 'hr-critical-high',
        vitalType: 'heartRate',
        condition: 'above',
        value: 120,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Critical high heart rate'
      },
      {
        id: 'hr-critical-low',
        vitalType: 'heartRate',
        condition: 'below',
        value: 50,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Critical low heart rate'
      },
      {
        id: 'hr-warning-high',
        vitalType: 'heartRate',
        condition: 'above',
        value: 100,
        severity: 'warning',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Warning high heart rate'
      },
      {
        id: 'hr-warning-low',
        vitalType: 'heartRate',
        condition: 'below',
        value: 60,
        severity: 'warning',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Warning low heart rate'
      },
      // Blood Pressure Thresholds
      {
        id: 'bp-systolic-critical',
        vitalType: 'bloodPressure',
        parameter: 'systolic',
        condition: 'above',
        value: 180,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Critical high systolic pressure'
      },
      {
        id: 'bp-diastolic-critical',
        vitalType: 'bloodPressure',
        parameter: 'diastolic',
        condition: 'above',
        value: 110,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Critical high diastolic pressure'
      },
      // Temperature Thresholds
      {
        id: 'temp-fever-warning',
        vitalType: 'temperature',
        condition: 'above',
        value: 100.4,
        severity: 'warning',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Fever detected'
      },
      {
        id: 'temp-fever-critical',
        vitalType: 'temperature',
        condition: 'above',
        value: 103.0,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'High fever - critical'
      },
      // Oxygen Saturation Thresholds
      {
        id: 'o2-warning',
        vitalType: 'oxygenSaturation',
        condition: 'below',
        value: 95,
        severity: 'warning',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Low oxygen saturation'
      },
      {
        id: 'o2-critical',
        vitalType: 'oxygenSaturation',
        condition: 'below',
        value: 90,
        severity: 'critical',
        enabled: true,
        createdBy: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: 'Critical low oxygen saturation'
      }
    ];

    this.thresholds = defaultThresholds;
  }

  private loadDemoAlerts() {
    const demoAlerts: Alert[] = [
      {
        id: 'alert-001',
        patientId: 'P001',
        patientName: 'Sarah Johnson',
        type: 'critical',
        title: 'Critical Heart Rate Alert',
        message: 'Heart rate of 145 BPM exceeds critical threshold of 120 BPM',
        vitalType: 'heartRate',
        vitalValue: 145,
        threshold: 120,
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        acknowledged: false,
        resolved: false,
        priority: 'high',
        source: 'automatic',
        metadata: {
          deviceId: 'device-001',
          location: 'Room 101'
        },
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-002',
        patientId: 'P001',
        patientName: 'Sarah Johnson',
        type: 'critical',
        title: 'Critical Blood Pressure Alert',
        message: 'Blood pressure of 180/95 mmHg exceeds critical threshold',
        vitalType: 'bloodPressure',
        vitalValue: 180,
        threshold: 180,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        acknowledged: false,
        resolved: false,
        priority: 'high',
        source: 'automatic',
        metadata: {
          deviceId: 'device-002',
          location: 'Room 101'
        },
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: 'alert-003',
        patientId: 'P002',
        patientName: 'Michael Chen',
        type: 'warning',
        title: 'Elevated Blood Pressure',
        message: 'Blood pressure of 140/85 mmHg is elevated',
        vitalType: 'bloodPressure',
        vitalValue: 140,
        threshold: 140,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        acknowledged: true,
        acknowledgedBy: 'Dr. Sarah Mitchell',
        acknowledgedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
        resolved: false,
        priority: 'medium',
        source: 'automatic',
        metadata: {
          deviceId: 'device-002',
          location: 'Room 102'
        },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.alerts = demoAlerts;
  }

  public evaluateVitalSigns(vitals: VitalSigns): Alert[] {
    const newAlerts: Alert[] = [];
    const patientThresholds = this.getPatientThresholds(vitals.patientId);

    // Evaluate each vital sign against thresholds
    Object.entries(vitals.vitals).forEach(([vitalType, vitalData]) => {
      if (!vitalData) return;

      const relevantThresholds = patientThresholds.filter(t => 
        t.vitalType === vitalType && t.enabled
      );

      relevantThresholds.forEach(threshold => {
        const alert = this.checkThreshold(vitals, vitalType, vitalData, threshold);
        if (alert) {
          newAlerts.push(alert);
        }
      });
    });

    // Add new alerts to the system
    newAlerts.forEach(alert => {
      this.addAlert(alert);
    });

    return newAlerts;
  }

  private checkThreshold(
    vitals: VitalSigns, 
    vitalType: string, 
    vitalData: any, 
    threshold: AlertThreshold
  ): Alert | null {
    let value: number;
    let thresholdValue = threshold.value;

    // Extract the appropriate value based on vital type and parameter
    if (vitalType === 'bloodPressure') {
      if (threshold.parameter === 'systolic') {
        value = vitalData.systolic;
      } else if (threshold.parameter === 'diastolic') {
        value = vitalData.diastolic;
      } else {
        return null;
      }
    } else {
      value = vitalData.value;
    }

    // Check if threshold is violated
    let isViolated = false;
    let message = '';

    switch (threshold.condition) {
      case 'above':
        isViolated = value > thresholdValue;
        message = `${this.getVitalDisplayName(vitalType, threshold.parameter)} of ${value} exceeds threshold of ${thresholdValue}`;
        break;
      case 'below':
        isViolated = value < thresholdValue;
        message = `${this.getVitalDisplayName(vitalType, threshold.parameter)} of ${value} is below threshold of ${thresholdValue}`;
        break;
      case 'between':
        isViolated = value >= thresholdValue && value <= (threshold.secondaryValue || thresholdValue);
        message = `${this.getVitalDisplayName(vitalType, threshold.parameter)} of ${value} is within alert range`;
        break;
      case 'outside':
        isViolated = value < thresholdValue || value > (threshold.secondaryValue || thresholdValue);
        message = `${this.getVitalDisplayName(vitalType, threshold.parameter)} of ${value} is outside normal range`;
        break;
    }

    if (!isViolated) return null;

    // Check if we already have a recent similar alert
    const recentSimilarAlert = this.alerts.find(alert => 
      alert.patientId === vitals.patientId &&
      alert.vitalType === vitalType &&
      !alert.resolved &&
      Date.now() - new Date(alert.timestamp).getTime() < 30 * 60 * 1000 // 30 minutes
    );

    if (recentSimilarAlert) return null;

    // Create new alert
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId: vitals.patientId,
      patientName: this.getPatientName(vitals.patientId),
      type: threshold.severity === 'critical' ? 'critical' : threshold.severity === 'warning' ? 'warning' : 'info',
      title: `${threshold.severity.charAt(0).toUpperCase() + threshold.severity.slice(1)} ${this.getVitalDisplayName(vitalType, threshold.parameter)} Alert`,
      message,
      vitalType,
      vitalValue: value,
      threshold: thresholdValue,
      timestamp: vitals.timestamp,
      acknowledged: false,
      resolved: false,
      priority: threshold.severity === 'critical' ? 'high' : threshold.severity === 'warning' ? 'medium' : 'low',
      source: 'automatic',
      metadata: {
        deviceId: vitalData.deviceId,
        additionalInfo: threshold.description
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return alert;
  }

  private getVitalDisplayName(vitalType: string, parameter?: string): string {
    const names: Record<string, string> = {
      heartRate: 'Heart Rate',
      bloodPressure: parameter === 'systolic' ? 'Systolic BP' : parameter === 'diastolic' ? 'Diastolic BP' : 'Blood Pressure',
      temperature: 'Temperature',
      oxygenSaturation: 'Oxygen Saturation',
      weight: 'Weight',
      respiratoryRate: 'Respiratory Rate'
    };
    return names[vitalType] || vitalType;
  }

  private getPatientName(patientId: string): string {
    const patientNames: Record<string, string> = {
      'P001': 'Sarah Johnson',
      'P002': 'Michael Chen',
      'P003': 'Emma Rodriguez',
      'P004': 'Robert Davis'
    };
    return patientNames[patientId] || `Patient ${patientId}`;
  }

  private getPatientThresholds(patientId: string): AlertThreshold[] {
    return this.thresholds.filter(t => 
      !t.patientId || t.patientId === patientId
    );
  }

  public addAlert(alert: Alert): void {
    this.alerts.unshift(alert);
    this.notifyListeners(alert);
    this.addToHistory(alert.id, 'created', 'System');
  }

  public acknowledgeAlert(alertId: string, acknowledgedBy: string, notes?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.acknowledged) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date().toISOString();
    alert.updatedAt = new Date().toISOString();

    this.addToHistory(alertId, 'acknowledged', acknowledgedBy, notes);
    return true;
  }

  public resolveAlert(alertId: string, resolvedBy: string, notes?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert || alert.resolved) return false;

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date().toISOString();
    alert.updatedAt = new Date().toISOString();

    this.addToHistory(alertId, 'resolved', resolvedBy, notes);
    return true;
  }

  public createManualAlert(
    patientId: string,
    title: string,
    message: string,
    priority: 'high' | 'medium' | 'low',
    createdBy: string
  ): Alert {
    const alert: Alert = {
      id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      patientName: this.getPatientName(patientId),
      type: 'manual',
      title,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      resolved: false,
      priority,
      source: 'manual',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.addAlert(alert);
    return alert;
  }

  private addToHistory(
    alertId: string, 
    action: AlertHistory['action'], 
    performedBy: string, 
    notes?: string
  ): void {
    const historyEntry: AlertHistory = {
      id: `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      alertId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      notes
    };

    this.alertHistory.unshift(historyEntry);
  }

  public getAlerts(filters?: {
    patientId?: string;
    type?: string;
    acknowledged?: boolean;
    resolved?: boolean;
    priority?: string;
    limit?: number;
  }): Alert[] {
    let filtered = [...this.alerts];

    if (filters) {
      if (filters.patientId) {
        filtered = filtered.filter(a => a.patientId === filters.patientId);
      }
      if (filters.type) {
        filtered = filtered.filter(a => a.type === filters.type);
      }
      if (filters.acknowledged !== undefined) {
        filtered = filtered.filter(a => a.acknowledged === filters.acknowledged);
      }
      if (filters.resolved !== undefined) {
        filtered = filtered.filter(a => a.resolved === filters.resolved);
      }
      if (filters.priority) {
        filtered = filtered.filter(a => a.priority === filters.priority);
      }
      if (filters.limit) {
        filtered = filtered.slice(0, filters.limit);
      }
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public getActiveAlerts(): Alert[] {
    return this.getAlerts({ resolved: false });
  }

  public getCriticalAlerts(): Alert[] {
    return this.getAlerts({ type: 'critical', resolved: false });
  }

  public getAlertHistory(alertId: string): AlertHistory[] {
    return this.alertHistory.filter(h => h.alertId === alertId);
  }

  public getThresholds(): AlertThreshold[] {
    return [...this.thresholds];
  }

  public addThreshold(threshold: Omit<AlertThreshold, 'id' | 'createdAt' | 'updatedAt'>): AlertThreshold {
    const newThreshold: AlertThreshold = {
      ...threshold,
      id: `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.thresholds.push(newThreshold);
    return newThreshold;
  }

  public updateThreshold(id: string, updates: Partial<AlertThreshold>): boolean {
    const threshold = this.thresholds.find(t => t.id === id);
    if (!threshold) return false;

    Object.assign(threshold, updates, { updatedAt: new Date().toISOString() });
    return true;
  }

  public deleteThreshold(id: string): boolean {
    const index = this.thresholds.findIndex(t => t.id === id);
    if (index === -1) return false;

    this.thresholds.splice(index, 1);
    return true;
  }

  public subscribe(listener: (alert: Alert) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(alert: Alert): void {
    this.listeners.forEach(listener => {
      try {
        listener(alert);
      } catch (error) {
        console.error('Error notifying alert listener:', error);
      }
    });
  }
}

// Singleton instance
export const alertService = new AlertService();