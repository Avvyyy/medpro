import React from 'react';
import { User, MapPin, Phone, AlertCircle } from 'lucide-react';

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  location: string;
  phone: string;
  status: 'stable' | 'monitoring' | 'emergency';
  lastVitals: {
    heartRate: number;
    temperature: number;
    bloodPressure: string;
    oxygen: number;
  };
  onClick: () => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ 
  id, name, age, location, phone, status, lastVitals, onClick 
}) => {
  const getStatusBadge = () => {
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

  return (
    <div 
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900">{name}</h3>
            <p className="text-gray-600">ID: {id} • Age: {age}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge()}`}>
          {status.toUpperCase()}
          {status === 'emergency' && <AlertCircle className="w-3 h-3 inline ml-1" />}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-gray-600">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <Phone className="w-4 h-4" />
          <span className="text-sm">{phone}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-semibold text-gray-700">Heart Rate</div>
          <div className="text-lg font-bold text-gray-900">{lastVitals.heartRate} BPM</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-semibold text-gray-700">Temperature</div>
          <div className="text-lg font-bold text-gray-900">{lastVitals.temperature}°F</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-semibold text-gray-700">Blood Pressure</div>
          <div className="text-lg font-bold text-gray-900">{lastVitals.bloodPressure}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="font-semibold text-gray-700">SpO2</div>
          <div className="text-lg font-bold text-gray-900">{lastVitals.oxygen}%</div>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;