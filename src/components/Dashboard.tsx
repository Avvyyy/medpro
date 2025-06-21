import React, { useState, useEffect } from 'react';
import { Activity, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import Header from './Header';
import PatientCard from './PatientCard';
import PatientDetailModal from './PatientDetailModal';
import EmergencyAlert from './EmergencyAlert';

const Dashboard: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [patients, setPatients] = useState([
    {
      id: 'P001',
      name: 'Sarah Johnson',
      age: 67,
      location: '123 Oak Street, Downtown',
      phone: '+1 (555) 123-4567',
      status: 'emergency' as const,
      lastVitals: { heartRate: 145, temperature: 101.2, bloodPressure: '180/95', oxygen: 92 },
      medicalHistory: ['Hypertension', 'Type 2 Diabetes', 'Previous MI'],
      emergencyContact: 'John Johnson (Son) - (555) 987-6543'
    },
    {
      id: 'P002',
      name: 'Michael Chen',
      age: 54,
      location: '456 Pine Avenue, Midtown',
      phone: '+1 (555) 234-5678',
      status: 'monitoring' as const,
      lastVitals: { heartRate: 88, temperature: 98.6, bloodPressure: '140/85', oxygen: 97 },
      medicalHistory: ['Arrhythmia', 'High Cholesterol'],
      emergencyContact: 'Lisa Chen (Wife) - (555) 876-5432'
    },
    {
      id: 'P003',
      name: 'Emma Rodriguez',
      age: 43,
      location: '789 Maple Drive, Uptown',
      phone: '+1 (555) 345-6789',
      status: 'stable' as const,
      lastVitals: { heartRate: 72, temperature: 98.4, bloodPressure: '120/80', oxygen: 99 },
      medicalHistory: ['Asthma', 'Anxiety Disorder'],
      emergencyContact: 'Carlos Rodriguez (Husband) - (555) 765-4321'
    },
    {
      id: 'P004',
      name: 'Robert Davis',
      age: 71,
      location: '321 Elm Street, Riverside',
      phone: '+1 (555) 456-7890',
      status: 'stable' as const,
      lastVitals: { heartRate: 68, temperature: 97.8, bloodPressure: '130/75', oxygen: 98 },
      medicalHistory: ['COPD', 'Osteoarthritis', 'Sleep Apnea'],
      emergencyContact: 'Mary Davis (Wife) - (555) 654-3210'
    }
  ]);

  const emergencyPatient = patients.find(p => p.status === 'emergency');

  useEffect(() => {
    if (emergencyPatient && !showEmergencyAlert) {
      setShowEmergencyAlert(true);
    }
  }, [emergencyPatient, showEmergencyAlert]);

  const handlePatientClick = (patient: any) => {
    setSelectedPatient({
      ...patient,
      vitals: {
        heartRate: { 
          value: patient.lastVitals.heartRate.toString(), 
          status: patient.status === 'emergency' ? 'critical' : patient.status === 'monitoring' ? 'warning' : 'normal',
          trend: 'up' as const
        },
        temperature: { 
          value: patient.lastVitals.temperature.toString(), 
          status: patient.lastVitals.temperature > 100 ? 'warning' : 'normal',
          trend: 'stable' as const
        },
        bloodPressure: { 
          value: patient.lastVitals.bloodPressure, 
          status: patient.lastVitals.bloodPressure.startsWith('180') ? 'critical' : patient.lastVitals.bloodPressure.startsWith('140') ? 'warning' : 'normal',
          trend: 'down' as const
        },
        oxygen: { 
          value: patient.lastVitals.oxygen.toString(), 
          status: patient.lastVitals.oxygen < 95 ? 'critical' : 'normal',
          trend: 'stable' as const
        }
      }
    });
  };

  const handleDispatchEms = () => {
    alert('EMS has been dispatched to patient location. Estimated arrival: 8 minutes.');
    setShowEmergencyAlert(false);
  };

  const handleContactPatient = () => {
    alert('Calling patient...');
  };

  const dismissAlert = () => {
    setShowEmergencyAlert(false);
  };

  const stats = [
    { 
      title: 'Total Patients', 
      value: patients.length.toString(), 
      icon: Users, 
      color: 'bg-blue-500',
      change: '+2 this week'
    },
    { 
      title: 'Active Monitors', 
      value: patients.filter(p => p.status !== 'stable').length.toString(), 
      icon: Activity, 
      color: 'bg-green-500',
      change: '98.5% uptime'
    },
    { 
      title: 'Critical Alerts', 
      value: patients.filter(p => p.status === 'emergency').length.toString(), 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      change: '1 active'
    },
    { 
      title: 'Response Time', 
      value: '2.3', 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      change: 'avg minutes'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeAlerts={patients.filter(p => p.status === 'emergency').length} doctorName="Sarah Mitchell" />
      
      <main className="p-6">
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

        {/* Patients Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Patient Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {patients.map((patient) => (
              <PatientCard
                key={patient.id}
                {...patient}
                onClick={() => handlePatientClick(patient)}
              />
            ))}
          </div>
        </div>

        {/* Add more patients indicator */}
        <div className="text-center py-8">
          <p className="text-gray-500">Monitoring {patients.length} patients • System operational</p>
        </div>
      </main>

      {/* Modals */}
      {selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          vitals={selectedPatient.vitals}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {showEmergencyAlert && emergencyPatient && (
        <EmergencyAlert
          patientName={emergencyPatient.name}
          patientId={emergencyPatient.id}
          alertType="Critical Heart Rate & Blood Pressure"
          location={emergencyPatient.location}
          timestamp="Just now"
          vitals={emergencyPatient.lastVitals}
          onDispatchEms={handleDispatchEms}
          onContactPatient={handleContactPatient}
          onDismiss={dismissAlert}
        />
      )}
    </div>
  );
};

export default Dashboard;