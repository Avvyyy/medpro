import React from 'react';
import { AlertTriangle, Phone, MapPin, Clock, User } from 'lucide-react';

interface EmergencyAlertProps {
  patientName: string;
  patientId: string;
  alertType: string;
  location: string;
  timestamp: string;
  vitals: {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    oxygen: number;
  };
  onDispatchEms: () => void;
  onContactPatient: () => void;
  onDismiss: () => void;
}

const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  patientName,
  patientId,
  alertType,
  location,
  timestamp,
  vitals,
  onDispatchEms,
  onContactPatient,
  onDismiss
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-pulse-slow">
        <div className="bg-red-500 text-white p-4 rounded-t-xl">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-6 h-6 animate-bounce" />
            <h2 className="text-xl font-bold">EMERGENCY ALERT</h2>
          </div>
          <p className="text-red-100 mt-1">{alertType}</p>
        </div>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{patientName}</h3>
              <p className="text-gray-600">Patient ID: {patientId}</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{location}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{timestamp}</span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold mb-3">Current Vitals</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Heart Rate:</span>
                <span className="font-bold ml-2 text-red-600">{vitals.heartRate} BPM</span>
              </div>
              <div>
                <span className="text-gray-600">BP:</span>
                <span className="font-bold ml-2">{vitals.bloodPressure}</span>
              </div>
              <div>
                <span className="text-gray-600">Temperature:</span>
                <span className="font-bold ml-2">{vitals.temperature}°F</span>
              </div>
              <div>
                <span className="text-gray-600">SpO2:</span>
                <span className="font-bold ml-2">{vitals.oxygen}%</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onDispatchEms}
              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors flex items-center justify-center space-x-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Dispatch EMS</span>
            </button>
            <button
              onClick={onContactPatient}
              className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
            >
              <Phone className="w-4 h-4" />
              <span>Call Patient</span>
            </button>
          </div>

          <button
            onClick={onDismiss}
            className="w-full mt-3 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Dismiss Alert
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmergencyAlert;