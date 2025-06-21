import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Bell,
  Settings,
  Plus,
  Filter,
  Calendar,
  Heart,
  Thermometer,
  Eye
} from 'lucide-react';
import Header from '../components/Header';
import PatientOverview from '../components/dashboard/PatientOverview';
import VitalTrendsChart from '../components/dashboard/VitalTrendsChart';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import AlertThresholdManager from '../components/alerts/AlertThresholdManager';
import { VitalSigns } from '../types/vitals';
import { Alert } from '../types/alerts';
import { iotSimulator } from '../services/iotSimulator';
import { alertService } from '../services/alertService';

const Dashboard: React.FC = () => {
  const [vitalsData, setVitalsData] = useState<VitalSigns[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showThresholdManager, setShowThresholdManager] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  useEffect(() => {
    // Load initial data
    loadDemoVitals();
    loadAlerts();
    setIsSimulationRunning(iotSimulator.isSimulationRunning());

    // Subscribe to new alerts
    const unsubscribe = alertService.subscribe((newAlert) => {
      setAlerts(prev => [newAlert, ...prev]);
    });

    return unsubscribe;
  }, []);

  const loadDemoVitals = () => {
    // Generate comprehensive demo vital signs data
    const demoVitals: VitalSigns[] = [
      {
        id: 'vital-001',
        patientId: 'P001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        recordedBy: 'Dr. Sarah Mitchell',
        source: 'iot',
        vitals: {
          heartRate: { value: 145, unit: 'BPM', status: 'critical', trend: 'up' },
          bloodPressure: { systolic: 180, diastolic: 95, unit: 'mmHg', status: 'critical', trend: 'up' },
          temperature: { value: 101.2, unit: '°F', status: 'warning', trend: 'up' },
          oxygenSaturation: { value: 92, unit: '%', status: 'critical', trend: 'down' },
          weight: { value: 140, unit: 'lbs', status: 'normal', trend: 'stable' }
        },
        notes: 'Patient experiencing chest discomfort. Immediate attention required.',
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'vital-002',
        patientId: 'P002',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Nurse Lisa Chen',
        source: 'manual',
        vitals: {
          heartRate: { value: 88, unit: 'BPM', status: 'normal', trend: 'stable' },
          bloodPressure: { systolic: 140, diastolic: 85, unit: 'mmHg', status: 'warning', trend: 'stable' },
          temperature: { value: 98.6, unit: '°F', status: 'normal', trend: 'stable' },
          oxygenSaturation: { value: 97, unit: '%', status: 'normal', trend: 'stable' },
          weight: { value: 175, unit: 'lbs', status: 'normal', trend: 'stable' }
        },
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'vital-003',
        patientId: 'P003',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Dr. Sarah Mitchell',
        source: 'iot',
        vitals: {
          heartRate: { value: 72, unit: 'BPM', status: 'normal', trend: 'stable' },
          bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'normal', trend: 'stable' },
          temperature: { value: 98.4, unit: '°F', status: 'normal', trend: 'stable' },
          oxygenSaturation: { value: 99, unit: '%', status: 'normal', trend: 'stable' },
          weight: { value: 130, unit: 'lbs', status: 'normal', trend: 'stable' }
        },
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'vital-004',
        patientId: 'P004',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        recordedBy: 'Nurse Jennifer Adams',
        source: 'manual',
        vitals: {
          heartRate: { value: 68, unit: 'BPM', status: 'normal', trend: 'stable' },
          bloodPressure: { systolic: 130, diastolic: 75, unit: 'mmHg', status: 'normal', trend: 'down' },
          temperature: { value: 97.8, unit: '°F', status: 'normal', trend: 'stable' },
          oxygenSaturation: { value: 98, unit: '%', status: 'normal', trend: 'stable' },
          weight: { value: 180, unit: 'lbs', status: 'normal', trend: 'stable' }
        },
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Generate historical data for trends
    const historicalData: VitalSigns[] = [];
    const patients = ['P001', 'P002', 'P003', 'P004'];
    
    patients.forEach(patientId => {
      for (let i = 0; i < 20; i++) {
        const timestamp = new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000).toISOString();
        historicalData.push({
          id: `historical-${patientId}-${i}`,
          patientId,
          timestamp,
          recordedBy: 'IoT System',
          source: 'iot',
          vitals: generateRandomVitals(patientId),
          alertsTriggered: [],
          createdAt: timestamp,
          updatedAt: timestamp
        });
      }
    });

    setVitalsData([...demoVitals, ...historicalData]);
  };

  const generateRandomVitals = (patientId: string) => {
    const baseValues = {
      'P001': { hr: 85, sys: 140, dia: 90, temp: 99.0, o2: 94 },
      'P002': { hr: 75, sys: 130, dia: 85, temp: 98.6, o2: 97 },
      'P003': { hr: 70, sys: 120, dia: 80, temp: 98.4, o2: 99 },
      'P004': { hr: 68, sys: 125, dia: 75, temp: 97.8, o2: 98 }
    };

    const base = baseValues[patientId as keyof typeof baseValues];
    const variation = 0.1;

    return {
      heartRate: {
        value: Math.round(base.hr + (Math.random() - 0.5) * base.hr * variation),
        unit: 'BPM',
        status: 'normal' as const,
        trend: 'stable' as const
      },
      bloodPressure: {
        systolic: Math.round(base.sys + (Math.random() - 0.5) * base.sys * variation),
        diastolic: Math.round(base.dia + (Math.random() - 0.5) * base.dia * variation),
        unit: 'mmHg',
        status: 'normal' as const,
        trend: 'stable' as const
      },
      temperature: {
        value: Math.round((base.temp + (Math.random() - 0.5) * base.temp * variation) * 10) / 10,
        unit: '°F',
        status: 'normal' as const,
        trend: 'stable' as const
      },
      oxygenSaturation: {
        value: Math.round(base.o2 + (Math.random() - 0.5) * base.o2 * variation),
        unit: '%',
        status: 'normal' as const,
        trend: 'stable' as const
      },
      weight: {
        value: 150 + Math.round((Math.random() - 0.5) * 20),
        unit: 'lbs',
        status: 'normal' as const,
        trend: 'stable' as const
      }
    };
  };

  const loadAlerts = () => {
    const systemAlerts = alertService.getAlerts({ limit: 10 });
    setAlerts(systemAlerts);
  };

  const handlePatientSelect = (patient: any) => {
    setSelectedPatient(patient);
  };

  const handleViewPatientDetails = (patient: any) => {
    // This would typically navigate to a detailed patient view
    console.log('View patient details:', patient);
  };

  const handleStartSimulation = () => {
    iotSimulator.startSimulation((data) => {
      setVitalsData(prev => [data, ...prev]);
      // Evaluate new vitals for alerts
      const newAlerts = alertService.evaluateVitalSigns(data);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev]);
      }
    });
    setIsSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    iotSimulator.stopSimulation();
    setIsSimulationRunning(false);
  };

  const handleCreateAlert = () => {
    setShowCreateAlert(true);
  };

  // Calculate dashboard statistics
  const totalPatients = 4;
  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.resolved).length;
  const patientsWithCriticalVitals = new Set(
    vitalsData
      .filter(v => Object.values(v.vitals).some((vital: any) => vital?.status === 'critical'))
      .map(v => v.patientId)
  ).size;

  const stats = [
    { 
      title: 'Total Patients', 
      value: totalPatients.toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    { 
      title: 'Active Alerts', 
      value: activeAlerts.toString(), 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      change: `${criticalAlerts} critical`
    },
    { 
      title: 'Patients Monitored', 
      value: vitalsData.length > 0 ? new Set(vitalsData.map(v => v.patientId)).size.toString() : '0', 
      icon: Activity, 
      color: 'bg-green-500',
      change: '98.5% uptime'
    },
    { 
      title: 'Critical Patients', 
      value: patientsWithCriticalVitals.toString(), 
      icon: Heart, 
      color: 'bg-purple-500',
      change: 'Requires attention'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeAlerts={criticalAlerts} doctorName="Sarah Mitchell" />
      
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Healthcare Provider Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor patients, track vital signs, and manage alerts in real-time</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowThresholdManager(true)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Thresholds</span>
              </button>
              <button
                onClick={handleCreateAlert}
                className="flex items-center space-x-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Alert</span>
              </button>
              {isSimulationRunning ? (
                <button
                  onClick={handleStopSimulation}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  <span>Stop IoT</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSimulation}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  <span>Start IoT</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Patient Overview - Takes up 2 columns */}
          <div className="xl:col-span-2">
            <PatientOverview
              vitalsData={vitalsData}
              onPatientSelect={handlePatientSelect}
              onViewPatientDetails={handleViewPatientDetails}
            />
          </div>

          {/* Alerts Panel - Takes up 1 column */}
          <div className="xl:col-span-1">
            <AlertsPanel
              showCreateAlert={true}
              onCreateAlert={handleCreateAlert}
            />
          </div>
        </div>

        {/* Vital Signs Trends Chart */}
        {selectedPatient && (
          <div className="mb-8">
            <VitalTrendsChart
              patientId={selectedPatient.id}
              patientName={selectedPatient.name}
              vitalsData={vitalsData}
            />
          </div>
        )}

        {/* Recent Activity Summary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Last 24 hours</span>
            </div>
          </div>

          <div className="space-y-4">
            {vitalsData.slice(0, 5).map((vital, index) => (
              <div key={vital.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    vital.source === 'iot' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {vital.source === 'iot' ? (
                      <Activity className="w-5 h-5 text-blue-600" />
                    ) : (
                      <Heart className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Vital signs recorded for Patient {vital.patientId}
                    </div>
                    <div className="text-sm text-gray-600">
                      {vital.recordedBy} • {new Date(vital.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vital.source === 'iot' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {vital.source.toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      const patient = { id: vital.patientId, name: `Patient ${vital.patientId}` };
                      handlePatientSelect(patient);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showThresholdManager && (
        <AlertThresholdManager
          onClose={() => setShowThresholdManager(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;