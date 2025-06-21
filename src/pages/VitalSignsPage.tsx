import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Search, 
  Filter, 
  Activity, 
  Thermometer,
  Scale,
  Stethoscope,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Settings,
  Download,
  Play,
  Pause,
  Wifi
} from 'lucide-react';
import Header from '../components/Header';
import VitalSignsEntry from '../components/vitals/VitalSignsEntry';
import VitalSignsHistory from '../components/vitals/VitalSignsHistory';
import IoTDeviceManager from '../components/vitals/IoTDeviceManager';
import { VitalSigns } from '../types/vitals';
import { iotSimulator } from '../services/iotSimulator';

const VitalSignsPage: React.FC = () => {
  const [vitalsData, setVitalsData] = useState<VitalSigns[]>([]);
  const [filteredVitals, setFilteredVitals] = useState<VitalSigns[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeviceManager, setShowDeviceManager] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [editingVitals, setEditingVitals] = useState<VitalSigns | null>(null);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);

  // Demo patients for vital signs
  const patients = [
    { id: 'P001', name: 'Sarah Johnson', age: 67, status: 'critical' },
    { id: 'P002', name: 'Michael Chen', age: 54, status: 'active' },
    { id: 'P003', name: 'Emma Rodriguez', age: 43, status: 'active' },
    { id: 'P004', name: 'Robert Davis', age: 71, status: 'active' }
  ];

  useEffect(() => {
    // Load demo vital signs data
    loadDemoVitals();
    setIsSimulationRunning(iotSimulator.isSimulationRunning());
  }, []);

  useEffect(() => {
    // Filter vitals based on search and status
    let filtered = vitalsData;

    if (searchTerm) {
      filtered = filtered.filter(vital => {
        const patient = patients.find(p => p.id === vital.patientId);
        return patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               vital.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
               vital.recordedBy.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(vital => {
        const hasAnyStatus = Object.values(vital.vitals).some((reading: any) => 
          reading && reading.status === statusFilter
        );
        return hasAnyStatus;
      });
    }

    setFilteredVitals(filtered);
  }, [searchTerm, statusFilter, vitalsData]);

  const loadDemoVitals = () => {
    // Generate some demo vital signs
    const demoVitals: VitalSigns[] = [
      {
        id: 'vital-001',
        patientId: 'P001',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        recordedBy: 'Dr. Sarah Mitchell',
        source: 'manual',
        vitals: {
          heartRate: { value: 145, unit: 'BPM', status: 'critical', trend: 'up' },
          bloodPressure: { systolic: 180, diastolic: 95, unit: 'mmHg', status: 'critical', trend: 'up' },
          temperature: { value: 101.2, unit: '°F', status: 'warning', trend: 'up' },
          oxygenSaturation: { value: 92, unit: '%', status: 'critical', trend: 'down' }
        },
        notes: 'Patient experiencing chest discomfort. Immediate attention required.',
        alertsTriggered: [
          {
            id: 'alert-001',
            type: 'critical',
            message: 'Critical heart rate and blood pressure detected',
            vitalType: 'heartRate',
            threshold: 100,
            actualValue: 145,
            timestamp: new Date().toISOString(),
            acknowledged: false
          }
        ],
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'vital-002',
        patientId: 'P002',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        recordedBy: 'Nurse Lisa Chen',
        source: 'iot',
        vitals: {
          heartRate: { value: 88, unit: 'BPM', status: 'normal', trend: 'stable' },
          bloodPressure: { systolic: 140, diastolic: 85, unit: 'mmHg', status: 'warning', trend: 'stable' },
          temperature: { value: 98.6, unit: '°F', status: 'normal', trend: 'stable' },
          oxygenSaturation: { value: 97, unit: '%', status: 'normal', trend: 'stable' }
        },
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'vital-003',
        patientId: 'P003',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        recordedBy: 'Dr. Sarah Mitchell',
        source: 'manual',
        vitals: {
          heartRate: { value: 72, unit: 'BPM', status: 'normal', trend: 'stable' },
          bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'normal', trend: 'stable' },
          temperature: { value: 98.4, unit: '°F', status: 'normal', trend: 'stable' },
          oxygenSaturation: { value: 99, unit: '%', status: 'normal', trend: 'stable' },
          weight: { value: 130.5, unit: 'lbs', status: 'normal', trend: 'stable' }
        },
        notes: 'Routine check-up. All vitals within normal range.',
        alertsTriggered: [],
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    setVitalsData(demoVitals);
  };

  const handleSaveVitals = (newVitals: VitalSigns) => {
    if (editingVitals) {
      // Update existing vitals
      setVitalsData(prev => prev.map(vital => 
        vital.id === editingVitals.id ? newVitals : vital
      ));
    } else {
      // Add new vitals
      setVitalsData(prev => [newVitals, ...prev]);
    }
    
    setShowEntryModal(false);
    setEditingVitals(null);
    setSelectedPatient(null);
  };

  const handleStartSimulation = () => {
    iotSimulator.startSimulation((data) => {
      console.log('New IoT data received:', data);
      setVitalsData(prev => [data, ...prev]);
    });
    setIsSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    iotSimulator.stopSimulation();
    setIsSimulationRunning(false);
  };

  const handleAddVitals = (patient: any) => {
    setSelectedPatient(patient);
    setEditingVitals(null);
    setShowEntryModal(true);
  };

  const handleEditVitals = (vitals: VitalSigns) => {
    const patient = patients.find(p => p.id === vitals.patientId);
    setSelectedPatient(patient);
    setEditingVitals(vitals);
    setShowEntryModal(true);
  };

  const handleViewHistory = (patient: any) => {
    setSelectedPatient(patient);
    setShowHistoryModal(true);
  };

  const getPatientVitals = (patientId: string) => {
    return vitalsData.filter(vital => vital.patientId === patientId);
  };

  const getLatestVitals = (patientId: string) => {
    const patientVitals = getPatientVitals(patientId);
    return patientVitals.length > 0 ? patientVitals[0] : null;
  };

  const getVitalStatus = (patientId: string) => {
    const latest = getLatestVitals(patientId);
    if (!latest) return 'unknown';
    
    const statuses = Object.values(latest.vitals).map((vital: any) => vital?.status).filter(Boolean);
    if (statuses.includes('critical')) return 'critical';
    if (statuses.includes('warning')) return 'warning';
    return 'normal';
  };

  const stats = [
    {
      title: 'Total Readings',
      value: vitalsData.length.toString(),
      icon: Activity,
      color: 'bg-blue-500',
      change: '+15 today'
    },
    {
      title: 'Critical Alerts',
      value: vitalsData.filter(v => v.alertsTriggered.length > 0).length.toString(),
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '2 active'
    },
    {
      title: 'IoT Devices',
      value: iotSimulator.getDevices().filter(d => d.status === 'online').length.toString(),
      icon: Wifi,
      color: 'bg-green-500',
      change: `${iotSimulator.getDevices().length} total`
    },
    {
      title: 'Patients Monitored',
      value: new Set(vitalsData.map(v => v.patientId)).size.toString(),
      icon: Heart,
      color: 'bg-purple-500',
      change: 'Active monitoring'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeAlerts={vitalsData.filter(v => v.alertsTriggered.length > 0).length} doctorName="Sarah Mitchell" />
      
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vital Signs Management</h1>
              <p className="text-gray-600 mt-2">Monitor patient vital signs, manage IoT devices, and track health trends</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeviceManager(true)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Devices</span>
              </button>
              {isSimulationRunning ? (
                <button
                  onClick={handleStopSimulation}
                  className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Stop IoT</span>
                </button>
              ) : (
                <button
                  onClick={handleStartSimulation}
                  className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Play className="w-4 h-4" />
                  <span>Start IoT</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Patient Vital Signs Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {patients.map((patient) => {
              const latestVitals = getLatestVitals(patient.id);
              const vitalStatus = getVitalStatus(patient.id);
              const patientVitalsCount = getPatientVitals(patient.id).length;

              return (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
                >
                  {/* Patient Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{patient.name}</h3>
                      <p className="text-gray-600">ID: {patient.id} • Age: {patient.age}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      vitalStatus === 'critical' ? 'bg-red-100 text-red-800 border-red-200 animate-pulse' :
                      vitalStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                      vitalStatus === 'normal' ? 'bg-green-100 text-green-800 border-green-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }`}>
                      {vitalStatus.toUpperCase()}
                      {vitalStatus === 'critical' && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>

                  {/* Latest Vitals */}
                  {latestVitals ? (
                    <div className="space-y-3 mb-4">
                      {latestVitals.vitals.heartRate && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600">Heart Rate</span>
                          </div>
                          <span className={`font-semibold ${
                            latestVitals.vitals.heartRate.status === 'critical' ? 'text-red-600' :
                            latestVitals.vitals.heartRate.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {latestVitals.vitals.heartRate.value} {latestVitals.vitals.heartRate.unit}
                          </span>
                        </div>
                      )}

                      {latestVitals.vitals.bloodPressure && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <span className="text-sm text-gray-600">Blood Pressure</span>
                          </div>
                          <span className={`font-semibold ${
                            latestVitals.vitals.bloodPressure.status === 'critical' ? 'text-red-600' :
                            latestVitals.vitals.bloodPressure.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {latestVitals.vitals.bloodPressure.systolic}/{latestVitals.vitals.bloodPressure.diastolic}
                          </span>
                        </div>
                      )}

                      {latestVitals.vitals.temperature && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-orange-500" />
                            <span className="text-sm text-gray-600">Temperature</span>
                          </div>
                          <span className={`font-semibold ${
                            latestVitals.vitals.temperature.status === 'critical' ? 'text-red-600' :
                            latestVitals.vitals.temperature.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {latestVitals.vitals.temperature.value}°F
                          </span>
                        </div>
                      )}

                      {latestVitals.vitals.oxygenSaturation && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">SpO2</span>
                          </div>
                          <span className={`font-semibold ${
                            latestVitals.vitals.oxygenSaturation.status === 'critical' ? 'text-red-600' :
                            latestVitals.vitals.oxygenSaturation.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {latestVitals.vitals.oxygenSaturation.value}%
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500 mt-2">
                        Last reading: {new Date(latestVitals.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No vital signs recorded</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleAddVitals(patient)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                    <button
                      onClick={() => handleViewHistory(patient)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-1"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>History ({patientVitalsCount})</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Vital Signs Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Vital Signs</h2>
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex items-center space-x-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="normal">Normal</option>
                    <option value="warning">Warning</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Patient</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Timestamp</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Heart Rate</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Blood Pressure</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Temperature</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Source</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVitals.slice(0, 10).map((vital) => {
                  const patient = patients.find(p => p.id === vital.patientId);
                  return (
                    <tr key={vital.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-semibold text-gray-900">{patient?.name}</div>
                          <div className="text-sm text-gray-600">{vital.patientId}</div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{new Date(vital.timestamp).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-600">{new Date(vital.timestamp).toLocaleTimeString()}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        {vital.vitals.heartRate ? (
                          <div className={`font-medium ${
                            vital.vitals.heartRate.status === 'critical' ? 'text-red-600' :
                            vital.vitals.heartRate.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {vital.vitals.heartRate.value} {vital.vitals.heartRate.unit}
                          
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        {vital.vitals.bloodPressure ? (
                          <div className={`font-medium ${
                            vital.vitals.bloodPressure.status === 'critical' ? 'text-red-600' :
                            vital.vitals.bloodPressure.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {vital.vitals.bloodPressure.systolic}/{vital.vitals.bloodPressure.diastolic}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        {vital.vitals.temperature ? (
                          <div className={`font-medium ${
                            vital.vitals.temperature.status === 'critical' ? 'text-red-600' :
                            vital.vitals.temperature.status === 'warning' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {vital.vitals.temperature.value}°F
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm">
                            {vital.source === 'manual' ? '👤' : vital.source === 'iot' ? '📡' : '🔧'}
                          </span>
                          <span className="text-sm capitalize">{vital.source}</span>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          {vital.source === 'manual' && (
                            <button
                              onClick={() => handleEditVitals(vital)}
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            onClick={() => handleViewHistory(patient!)}
                            className="text-gray-600 hover:text-gray-700 text-sm"
                          >
                            History
                          </button>
                          {vital.alertsTriggered.length > 0 && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredVitals.length === 0 && (
            <div className="p-12 text-center">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No vital signs found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start by recording vital signs for your patients.'
                }
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {showEntryModal && selectedPatient && (
        <VitalSignsEntry
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          onClose={() => {
            setShowEntryModal(false);
            setSelectedPatient(null);
            setEditingVitals(null);
          }}
          onSave={handleSaveVitals}
          existingVitals={editingVitals}
        />
      )}

      {showHistoryModal && selectedPatient && (
        <VitalSignsHistory
          patientId={selectedPatient.id}
          patientName={selectedPatient.name}
          vitalsHistory={getPatientVitals(selectedPatient.id)}
          onClose={() => {
            setShowHistoryModal(false);
            setSelectedPatient(null);
          }}
          onEdit={handleEditVitals}
        />
      )}

      {showDeviceManager && (
        <IoTDeviceManager
          onClose={() => setShowDeviceManager(false)}
        />
      )}
    </div>
  );
};

export default VitalSignsPage;