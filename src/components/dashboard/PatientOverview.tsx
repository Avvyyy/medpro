import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Heart, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Eye,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { VitalSigns } from '../../types/vitals';
import { Alert } from '../../types/alerts';
import { alertService } from '../../services/alertService';

interface Patient {
  id: string;
  name: string;
  age: number;
  location: string;
  phone: string;
  status: 'stable' | 'monitoring' | 'emergency';
  assignedDoctor: string;
  lastVitals?: VitalSigns;
  alerts: Alert[];
}

interface PatientOverviewProps {
  vitalsData: VitalSigns[];
  onPatientSelect: (patient: Patient) => void;
  onViewPatientDetails: (patient: Patient) => void;
}

const PatientOverview: React.FC<PatientOverviewProps> = ({
  vitalsData,
  onPatientSelect,
  onViewPatientDetails
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sortBy, setSortBy] = useState<'name' | 'status' | 'lastUpdate'>('status');
  const [filterStatus, setFilterStatus] = useState<'all' | 'stable' | 'monitoring' | 'emergency'>('all');

  // Demo patients data
  const basePatients = [
    {
      id: 'P001',
      name: 'Sarah Johnson',
      age: 67,
      location: '123 Oak Street, Downtown',
      phone: '+1 (555) 123-4567',
      assignedDoctor: 'Dr. Sarah Mitchell'
    },
    {
      id: 'P002',
      name: 'Michael Chen',
      age: 54,
      location: '456 Pine Avenue, Midtown',
      phone: '+1 (555) 234-5678',
      assignedDoctor: 'Dr. Sarah Mitchell'
    },
    {
      id: 'P003',
      name: 'Emma Rodriguez',
      age: 43,
      location: '789 Maple Drive, Uptown',
      phone: '+1 (555) 345-6789',
      assignedDoctor: 'Dr. Sarah Mitchell'
    },
    {
      id: 'P004',
      name: 'Robert Davis',
      age: 71,
      location: '321 Elm Street, Riverside',
      phone: '+1 (555) 456-7890',
      assignedDoctor: 'Dr. Sarah Mitchell'
    }
  ];

  useEffect(() => {
    updatePatients();
  }, [vitalsData]);

  const updatePatients = () => {
    const updatedPatients = basePatients.map(basePatient => {
      // Get latest vitals for this patient
      const patientVitals = vitalsData
        .filter(v => v.patientId === basePatient.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      const lastVitals = patientVitals[0];
      
      // Get alerts for this patient
      const patientAlerts = alertService.getAlerts({ 
        patientId: basePatient.id, 
        resolved: false 
      });

      // Determine status based on vitals and alerts
      let status: 'stable' | 'monitoring' | 'emergency' = 'stable';
      
      if (patientAlerts.some(alert => alert.type === 'critical')) {
        status = 'emergency';
      } else if (patientAlerts.length > 0 || (lastVitals && hasWarningVitals(lastVitals))) {
        status = 'monitoring';
      }

      return {
        ...basePatient,
        status,
        lastVitals,
        alerts: patientAlerts
      };
    });

    setPatients(updatedPatients);
  };

  const hasWarningVitals = (vitals: VitalSigns): boolean => {
    return Object.values(vitals.vitals).some((vital: any) => 
      vital && (vital.status === 'warning' || vital.status === 'critical')
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'monitoring':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'emergency':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'stable':
        return <Heart className="w-4 h-4 text-green-600" />;
      case 'monitoring':
        return <Activity className="w-4 h-4 text-yellow-600" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Heart className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-3 h-3 text-blue-500" />;
      case 'stable':
        return <Minus className="w-3 h-3 text-gray-500" />;
      default:
        return null;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const filteredPatients = patients.filter(patient => 
    filterStatus === 'all' || patient.status === filterStatus
  );

  const sortedPatients = [...filteredPatients].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'status':
        const statusOrder = { emergency: 0, monitoring: 1, stable: 2 };
        return statusOrder[a.status] - statusOrder[b.status];
      case 'lastUpdate':
        const aTime = a.lastVitals ? new Date(a.lastVitals.timestamp).getTime() : 0;
        const bTime = b.lastVitals ? new Date(b.lastVitals.timestamp).getTime() : 0;
        return bTime - aTime;
      default:
        return 0;
    }
  });

  const stats = {
    total: patients.length,
    stable: patients.filter(p => p.status === 'stable').length,
    monitoring: patients.filter(p => p.status === 'monitoring').length,
    emergency: patients.filter(p => p.status === 'emergency').length
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Patient Overview</h2>
              <p className="text-gray-600">
                {stats.total} patients • {stats.emergency} emergency • {stats.monitoring} monitoring
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="all">All Status</option>
              <option value="emergency">Emergency</option>
              <option value="monitoring">Monitoring</option>
              <option value="stable">Stable</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="status">Sort by Status</option>
              <option value="name">Sort by Name</option>
              <option value="lastUpdate">Sort by Last Update</option>
            </select>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.stable}</div>
            <div className="text-sm text-green-600">Stable</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.monitoring}</div>
            <div className="text-sm text-yellow-600">Monitoring</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.emergency}</div>
            <div className="text-sm text-red-600">Emergency</div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedPatients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {filterStatus === 'all' 
                ? 'No patients are currently assigned.'
                : `No patients with ${filterStatus} status.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Patient Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                        <span className="text-sm text-gray-600">Age {patient.age}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${getStatusColor(patient.status)}`}>
                          {getStatusIcon(patient.status)}
                          <span>{patient.status.toUpperCase()}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{patient.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="w-3 h-3" />
                          <span>{patient.phone}</span>
                        </div>
                      </div>

                      {/* Latest Vitals */}
                      {patient.lastVitals && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {patient.lastVitals.vitals.heartRate && (
                            <div className="flex items-center space-x-1">
                              <Heart className="w-3 h-3 text-red-500" />
                              <span className={`font-medium ${
                                patient.lastVitals.vitals.heartRate.status === 'critical' ? 'text-red-600' :
                                patient.lastVitals.vitals.heartRate.status === 'warning' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {patient.lastVitals.vitals.heartRate.value} BPM
                              </span>
                              {getTrendIcon(patient.lastVitals.vitals.heartRate.trend)}
                            </div>
                          )}

                          {patient.lastVitals.vitals.bloodPressure && (
                            <div className="flex items-center space-x-1">
                              <Activity className="w-3 h-3 text-blue-500" />
                              <span className={`font-medium ${
                                patient.lastVitals.vitals.bloodPressure.status === 'critical' ? 'text-red-600' :
                                patient.lastVitals.vitals.bloodPressure.status === 'warning' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {patient.lastVitals.vitals.bloodPressure.systolic}/{patient.lastVitals.vitals.bloodPressure.diastolic}
                              </span>
                              {getTrendIcon(patient.lastVitals.vitals.bloodPressure.trend)}
                            </div>
                          )}

                          {patient.lastVitals.vitals.temperature && (
                            <div className="flex items-center space-x-1">
                              <span className="text-orange-500">🌡️</span>
                              <span className={`font-medium ${
                                patient.lastVitals.vitals.temperature.status === 'critical' ? 'text-red-600' :
                                patient.lastVitals.vitals.temperature.status === 'warning' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {patient.lastVitals.vitals.temperature.value}°F
                              </span>
                              {getTrendIcon(patient.lastVitals.vitals.temperature.trend)}
                            </div>
                          )}

                          {patient.lastVitals.vitals.oxygenSaturation && (
                            <div className="flex items-center space-x-1">
                              <span className="text-green-500">🫁</span>
                              <span className={`font-medium ${
                                patient.lastVitals.vitals.oxygenSaturation.status === 'critical' ? 'text-red-600' :
                                patient.lastVitals.vitals.oxygenSaturation.status === 'warning' ? 'text-yellow-600' :
                                'text-green-600'
                              }`}>
                                {patient.lastVitals.vitals.oxygenSaturation.value}%
                              </span>
                              {getTrendIcon(patient.lastVitals.vitals.oxygenSaturation.trend)}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Alerts Summary */}
                      {patient.alerts.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="text-sm text-red-600 font-medium">
                            {patient.alerts.length} active alert{patient.alerts.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}

                      {/* Last Update */}
                      {patient.lastVitals && (
                        <div className="mt-2 flex items-center space-x-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>Last update: {formatTimeAgo(patient.lastVitals.timestamp)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewPatientDetails(patient);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientOverview;