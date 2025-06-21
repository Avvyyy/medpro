import React from 'react';
import { Heart, Thermometer, Activity, AlertTriangle } from 'lucide-react';

interface VitalCardProps {
  type: 'heartRate' | 'temperature' | 'bloodPressure' | 'oxygen';
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

const VitalCard: React.FC<VitalCardProps> = ({ type, value, unit, status, trend, lastUpdated }) => {
  const getIcon = () => {
    switch (type) {
      case 'heartRate':
        return <Heart className="w-6 h-6" />;
      case 'temperature':
        return <Thermometer className="w-6 h-6" />;
      case 'bloodPressure':
        return <Activity className="w-6 h-6" />;
      case 'oxygen':
        return <Activity className="w-6 h-6" />;
      default:
        return <Activity className="w-6 h-6" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      case 'stable':
        return '→';
    }
  };

  return (
    <div className={`p-4 rounded-xl border-2 ${getStatusColor()} transition-all duration-300 hover:shadow-lg`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getIcon()}
          <h3 className="font-semibold text-sm uppercase tracking-wide">
            {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
          </h3>
        </div>
        {status === 'critical' && <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />}
      </div>
      
      <div className="flex items-baseline space-x-2">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm opacity-70">{unit}</span>
        <span className="text-lg">{getTrendIcon()}</span>
      </div>
      
      <p className="text-xs opacity-70 mt-2">Updated {lastUpdated}</p>
    </div>
  );
};

export default VitalCard;