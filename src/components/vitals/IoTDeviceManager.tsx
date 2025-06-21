import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  Battery, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Wrench,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { IoTDevice } from '../../types/vitals';
import { iotSimulator } from '../../services/iotSimulator';

interface IoTDeviceManagerProps {
  patientId?: string;
  onClose: () => void;
}

const IoTDeviceManager: React.FC<IoTDeviceManagerProps> = ({
  patientId,
  onClose
}) => {
  const [devices, setDevices] = useState<IoTDevice[]>([]);
  const [isSimulationRunning, setIsSimulationRunning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<IoTDevice | null>(null);

  useEffect(() => {
    loadDevices();
    setIsSimulationRunning(iotSimulator.isSimulationRunning());
  }, []);

  const loadDevices = () => {
    const allDevices = iotSimulator.getDevices();
    const filteredDevices = patientId 
      ? allDevices.filter(device => device.patientId === patientId)
      : allDevices;
    setDevices(filteredDevices);
  };

  const handleStartSimulation = () => {
    iotSimulator.startSimulation((data) => {
      console.log('New IoT data received:', data);
      // Update device last reading times
      loadDevices();
    });
    setIsSimulationRunning(true);
  };

  const handleStopSimulation = () => {
    iotSimulator.stopSimulation();
    setIsSimulationRunning(false);
  };

  const handleDeviceStatusChange = (deviceId: string, newStatus: IoTDevice['status']) => {
    iotSimulator.updateDeviceStatus(deviceId, newStatus);
    loadDevices();
  };

  const getStatusColor = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: IoTDevice['status']) => {
    switch (status) {
      case 'online':
        return <Wifi className="w-4 h-4" />;
      case 'offline':
        return <WifiOff className="w-4 h-4" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4" />;
      case 'maintenance':
        return <Wrench className="w-4 h-4" />;
      default:
        return <WifiOff className="w-4 h-4" />;
    }
  };

  const getDeviceTypeIcon = (type: IoTDevice['type']) => {
    switch (type) {
      case 'heart_monitor':
        return '❤️';
      case 'blood_pressure':
        return '🩺';
      case 'thermometer':
        return '🌡️';
      case 'pulse_oximeter':
        return '🫁';
      case 'scale':
        return '⚖️';
      case 'multi_sensor':
        return '📊';
      default:
        return '📱';
    }
  };

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400';
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatLastReading = (timestamp: string) => {
    const now = new Date();
    const lastReading = new Date(timestamp);
    const diffMs = now.getTime() - lastReading.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">IoT Device Manager</h2>
            <p className="text-blue-100">
              {patientId ? `Devices for Patient ${patientId}` : 'All Connected Devices'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {isSimulationRunning ? (
              <button
                onClick={handleStopSimulation}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Pause className="w-4 h-4" />
                <span>Stop Simulation</span>
              </button>
            ) : (
              <button
                onClick={handleStartSimulation}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Start Simulation</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Simulation Status */}
          <div className={`mb-6 p-4 rounded-lg border ${
            isSimulationRunning 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-gray-50 border-gray-200 text-gray-800'
          }`}>
            <div className="flex items-center space-x-2">
              {isSimulationRunning ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <Clock className="w-5 h-5 text-gray-600" />
              )}
              <span className="font-medium">
                IoT Simulation: {isSimulationRunning ? 'Running' : 'Stopped'}
              </span>
            </div>
            <p className="text-sm mt-1">
              {isSimulationRunning 
                ? 'Devices are actively generating simulated vital signs data'
                : 'Start simulation to begin receiving mock IoT data from connected devices'
              }
            </p>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedDevice(device)}
              >
                {/* Device Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getDeviceTypeIcon(device.type)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{device.name}</h3>
                      <p className="text-sm text-gray-600">{device.id}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${getStatusColor(device.status)}`}>
                    {getStatusIcon(device.status)}
                    <span>{device.status.toUpperCase()}</span>
                  </div>
                </div>

                {/* Device Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Patient:</span>
                    <span className="font-medium">{device.patientId}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {device.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Reading:</span>
                    <span className="font-medium">{formatLastReading(device.lastReading)}</span>
                  </div>

                  {device.batteryLevel && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Battery:</span>
                      <span className={`font-medium flex items-center ${getBatteryColor(device.batteryLevel)}`}>
                        <Battery className="w-3 h-3 mr-1" />
                        {Math.round(device.batteryLevel)}%
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Firmware:</span>
                    <span className="font-medium">{device.firmwareVersion}</span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeviceStatusChange(
                          device.id, 
                          device.status === 'online' ? 'offline' : 'online'
                        );
                      }}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        device.status === 'online'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {device.status === 'online' ? 'Disconnect' : 'Connect'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeviceStatusChange(device.id, 'maintenance');
                      }}
                      className="flex-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Maintenance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {devices.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No devices found</h3>
              <p className="text-gray-600">
                {patientId 
                  ? 'No IoT devices are currently assigned to this patient.'
                  : 'No IoT devices are currently connected to the system.'
                }
              </p>
            </div>
          )}
        </div>

        {/* Device Detail Modal */}
        {selectedDevice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-t-xl flex justify-between items-center border-b">
                <h3 className="text-lg font-semibold text-gray-900">Device Details</h3>
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="text-4xl">{getDeviceTypeIcon(selectedDevice.type)}</div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedDevice.name}</h2>
                    <p className="text-gray-600">{selectedDevice.id}</p>
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border mt-2 ${getStatusColor(selectedDevice.status)}`}>
                      {getStatusIcon(selectedDevice.status)}
                      <span>{selectedDevice.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Device Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium capitalize">{selectedDevice.type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Patient ID:</span>
                        <span className="font-medium">{selectedDevice.patientId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{selectedDevice.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Firmware:</span>
                        <span className="font-medium">{selectedDevice.firmwareVersion}</span>
                      </div>
                      {selectedDevice.batteryLevel && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Battery Level:</span>
                          <span className={`font-medium ${getBatteryColor(selectedDevice.batteryLevel)}`}>
                            {Math.round(selectedDevice.batteryLevel)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Maintenance</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Reading:</span>
                        <span className="font-medium">{formatLastReading(selectedDevice.lastReading)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Calibration Date:</span>
                        <span className="font-medium">{new Date(selectedDevice.calibrationDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Next Maintenance:</span>
                        <span className="font-medium">{new Date(selectedDevice.nextMaintenanceDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Device Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => {
                        handleDeviceStatusChange(
                          selectedDevice.id,
                          selectedDevice.status === 'online' ? 'offline' : 'online'
                        );
                        setSelectedDevice({
                          ...selectedDevice,
                          status: selectedDevice.status === 'online' ? 'offline' : 'online'
                        });
                      }}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedDevice.status === 'online'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {selectedDevice.status === 'online' ? 'Disconnect Device' : 'Connect Device'}
                    </button>
                    <button
                      onClick={() => {
                        handleDeviceStatusChange(selectedDevice.id, 'maintenance');
                        setSelectedDevice({
                          ...selectedDevice,
                          status: 'maintenance'
                        });
                      }}
                      className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium hover:bg-yellow-200 transition-colors"
                    >
                      Maintenance Mode
                    </button>
                    <button
                      onClick={() => {
                        // Simulate device restart
                        handleDeviceStatusChange(selectedDevice.id, 'offline');
                        setTimeout(() => {
                          handleDeviceStatusChange(selectedDevice.id, 'online');
                          setSelectedDevice({
                            ...selectedDevice,
                            status: 'online'
                          });
                        }, 2000);
                      }}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restart Device</span>
                    </button>
                    <button
                      onClick={() => {
                        alert('Device calibration initiated. This process will take approximately 5 minutes.');
                      }}
                      className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium hover:bg-purple-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Calibrate</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IoTDeviceManager;