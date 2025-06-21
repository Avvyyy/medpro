import React from 'react';
import { X, Phone, MapPin, Clock, TrendingUp } from 'lucide-react';
import VitalCard from './VitalCard';

interface PatientDetailModalProps {
  patient: {
    id: string;
    name: string;
    age: number;
    location: string;
    phone: string;
    status: string;
    medicalHistory: string[];
    emergencyContact: string;
  };
  vitals: {
    heartRate: { value: string; status: 'normal' | 'warning' | 'critical'; trend: 'up' | 'down' | 'stable' };
    temperature: { value: string; status: 'normal' | 'warning' | 'critical'; trend: 'up' | 'down' | 'stable' };
    bloodPressure: { value: string; status: 'normal' | 'warning' | 'critical'; trend: 'up' | 'down' | 'stable' };
    oxygen: { value: string; status: 'normal' | 'warning' | 'critical'; trend: 'up' | 'down' | 'stable' };
  };
  onClose: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({ patient, vitals, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-blue-600 text-white p-6 rounded-t-xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <p className="text-blue-100">Patient ID: {patient.id} • Age: {patient.age}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-lg mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Patient Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patient.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">Last seen: 2 minutes ago</span>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Emergency Contact</h4>
                <p className="text-sm text-gray-600">{patient.emergencyContact}</p>
              </div>

              <div className="mt-6">
                <h4 className="font-semibold mb-2">Medical History</h4>
                <ul className="space-y-1">
                  {patient.medicalHistory.map((condition, index) => (
                    <li key={index} className="text-sm text-gray-600 bg-white rounded p-2">
                      {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="lg:col-span-2">
              <h3 className="font-bold text-lg mb-4">Real-time Vital Signs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <VitalCard
                  type="heartRate"
                  value={vitals.heartRate.value}
                  unit="BPM"
                  status={vitals.heartRate.status}
                  trend={vitals.heartRate.trend}
                  lastUpdated="30 seconds ago"
                />
                <VitalCard
                  type="temperature"
                  value={vitals.temperature.value}
                  unit="°F"
                  status={vitals.temperature.status}
                  trend={vitals.temperature.trend}
                  lastUpdated="1 minute ago"
                />
                <VitalCard
                  type="bloodPressure"
                  value={vitals.bloodPressure.value}
                  unit="mmHg"
                  status={vitals.bloodPressure.status}
                  trend={vitals.bloodPressure.trend}
                  lastUpdated="2 minutes ago"
                />
                <VitalCard
                  type="oxygen"
                  value={vitals.oxygen.value}
                  unit="%"
                  status={vitals.oxygen.status}
                  trend={vitals.oxygen.trend}
                  lastUpdated="45 seconds ago"
                />
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold mb-3">Recent Activity</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Device connected</span>
                    <span className="text-gray-500">2:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Heart rate spike detected</span>
                    <span className="text-gray-500">2:25 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily medication reminder sent</span>
                    <span className="text-gray-500">9:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors">
              Emergency Alert
            </button>
            <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Call Patient
            </button>
            <button className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors">
              Send Message
            </button>
            <button className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;