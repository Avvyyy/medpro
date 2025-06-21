import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Heart,
  Thermometer,
  Activity,
  Scale,
  Stethoscope,
  Filter,
  Download,
  Eye,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { VitalSigns } from '../../types/vitals';
import { formatVitalValue, formatBloodPressure } from '../../utils/vitalValidation';

interface VitalSignsHistoryProps {
  patientId: string;
  patientName: string;
  vitalsHistory: VitalSigns[];
  onClose: () => void;
  onEdit: (vitals: VitalSigns) => void;
}

const VitalSignsHistory: React.FC<VitalSignsHistoryProps> = ({
  patientId,
  patientName,
  vitalsHistory,
  onClose,
  onEdit
}) => {
  const [filteredHistory, setFilteredHistory] = useState<VitalSigns[]>([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [selectedVital, setSelectedVital] = useState<VitalSigns | null>(null);

  useEffect(() => {
    let filtered = [...vitalsHistory];

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case '24h':
          filterDate.setHours(now.getHours() - 24);
          break;
        case '7d':
          filterDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          filterDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          filterDate.setDate(now.getDate() - 90);
          break;
      }
      
      filtered = filtered.filter(vital => new Date(vital.timestamp) >= filterDate);
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(vital => vital.source === sourceFilter);
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setFilteredHistory(filtered);
  }, [vitalsHistory, dateFilter, sourceFilter]);

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-blue-500" />;
      case 'stable':
        return <Minus className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'manual':
        return '👤';
      case 'iot':
        return '📡';
      case 'device':
        return '🔧';
      default:
        return '❓';
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date/Time',
      'Heart Rate',
      'Blood Pressure',
      'Temperature',
      'Oxygen Saturation',
      'Weight',
      'Respiratory Rate',
      'Source',
      'Recorded By',
      'Notes'
    ];

    const csvData = filteredHistory.map(vital => [
      new Date(vital.timestamp).toLocaleString(),
      vital.vitals.heartRate ? `${vital.vitals.heartRate.value} ${vital.vitals.heartRate.unit}` : '',
      vital.vitals.bloodPressure ? `${vital.vitals.bloodPressure.systolic}/${vital.vitals.bloodPressure.diastolic} ${vital.vitals.bloodPressure.unit}` : '',
      vital.vitals.temperature ? `${vital.vitals.temperature.value} ${vital.vitals.temperature.unit}` : '',
      vital.vitals.oxygenSaturation ? `${vital.vitals.oxygenSaturation.value} ${vital.vitals.oxygenSaturation.unit}` : '',
      vital.vitals.weight ? `${vital.vitals.weight.value} ${vital.vitals.weight.unit}` : '',
      vital.vitals.respiratoryRate ? `${vital.vitals.respiratoryRate.value} ${vital.vitals.respiratoryRate.unit}` : '',
      vital.source,
      vital.recordedBy,
      vital.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${patientName.replace(/\s+/g, '_')}_vital_signs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Vital Signs History</h2>
            <p className="text-blue-100">Patient: {patientName}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportToCSV}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Time</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Sources</option>
                <option value="manual">Manual Entry</option>
                <option value="iot">IoT Devices</option>
                <option value="device">Medical Devices</option>
              </select>
            </div>

            <div className="ml-auto text-sm text-gray-600">
              Showing {filteredHistory.length} of {vitalsHistory.length} records
            </div>
          </div>

          {/* History Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Date/Time</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Heart Rate</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Blood Pressure</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Temperature</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">SpO2</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Source</th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredHistory.map((vital) => (
                    <tr key={vital.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(vital.timestamp).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(vital.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        {vital.vitals.heartRate ? (
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <div>
                              <div className={`font-medium ${getStatusColor(vital.vitals.heartRate.status)}`}>
                                {vital.vitals.heartRate.value} {vital.vitals.heartRate.unit}
                              </div>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(vital.vitals.heartRate.trend)}
                                <span className="text-xs text-gray-500">{vital.vitals.heartRate.status}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {vital.vitals.bloodPressure ? (
                          <div className="flex items-center space-x-2">
                            <Activity className="w-4 h-4 text-blue-500" />
                            <div>
                              <div className={`font-medium ${getStatusColor(vital.vitals.bloodPressure.status)}`}>
                                {vital.vitals.bloodPressure.systolic}/{vital.vitals.bloodPressure.diastolic} {vital.vitals.bloodPressure.unit}
                              </div>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(vital.vitals.bloodPressure.trend)}
                                <span className="text-xs text-gray-500">{vital.vitals.bloodPressure.status}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {vital.vitals.temperature ? (
                          <div className="flex items-center space-x-2">
                            <Thermometer className="w-4 h-4 text-orange-500" />
                            <div>
                              <div className={`font-medium ${getStatusColor(vital.vitals.temperature.status)}`}>
                                {vital.vitals.temperature.value} {vital.vitals.temperature.unit}
                              </div>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(vital.vitals.temperature.trend)}
                                <span className="text-xs text-gray-500">{vital.vitals.temperature.status}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        {vital.vitals.oxygenSaturation ? (
                          <div className="flex items-center space-x-2">
                            <Stethoscope className="w-4 h-4 text-green-500" />
                            <div>
                              <div className={`font-medium ${getStatusColor(vital.vitals.oxygenSaturation.status)}`}>
                                {vital.vitals.oxygenSaturation.value} {vital.vitals.oxygenSaturation.unit}
                              </div>
                              <div className="flex items-center space-x-1">
                                {getTrendIcon(vital.vitals.oxygenSaturation.trend)}
                                <span className="text-xs text-gray-500">{vital.vitals.oxygenSaturation.status}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{getSourceIcon(vital.source)}</span>
                          <div>
                            <div className="font-medium text-gray-900 capitalize">{vital.source}</div>
                            <div className="text-sm text-gray-600">{vital.recordedBy}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedVital(vital)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {vital.source === 'manual' && (
                            <button
                              onClick={() => onEdit(vital)}
                              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title="Edit Entry"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {vital.alertsTriggered.length > 0 && (
                            <div className="p-2 text-red-600" title="Alerts Triggered">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredHistory.length === 0 && (
              <div className="p-12 text-center">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No vital signs found</h3>
                <p className="text-gray-600">
                  {dateFilter !== 'all' || sourceFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results.'
                    : 'No vital signs have been recorded for this patient yet.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {selectedVital && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-t-xl flex justify-between items-center border-b">
                <h3 className="text-lg font-semibold text-gray-900">Vital Signs Details</h3>
                <button
                  onClick={() => setSelectedVital(null)}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Recording Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Date/Time:</strong> {new Date(selectedVital.timestamp).toLocaleString()}</div>
                      <div><strong>Recorded By:</strong> {selectedVital.recordedBy}</div>
                      <div><strong>Source:</strong> {selectedVital.source}</div>
                      <div><strong>Patient ID:</strong> {selectedVital.patientId}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Vital Signs</h4>
                    <div className="space-y-2 text-sm">
                      {selectedVital.vitals.heartRate && (
                        <div className="flex justify-between">
                          <span>Heart Rate:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.heartRate.status)}`}>
                            {selectedVital.vitals.heartRate.value} {selectedVital.vitals.heartRate.unit}
                          </span>
                        </div>
                      )}
                      {selectedVital.vitals.bloodPressure && (
                        <div className="flex justify-between">
                          <span>Blood Pressure:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.bloodPressure.status)}`}>
                            {selectedVital.vitals.bloodPressure.systolic}/{selectedVital.vitals.bloodPressure.diastolic} {selectedVital.vitals.bloodPressure.unit}
                          </span>
                        </div>
                      )}
                      {selectedVital.vitals.temperature && (
                        <div className="flex justify-between">
                          <span>Temperature:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.temperature.status)}`}>
                            {selectedVital.vitals.temperature.value} {selectedVital.vitals.temperature.unit}
                          </span>
                        </div>
                      )}
                      {selectedVital.vitals.oxygenSaturation && (
                        <div className="flex justify-between">
                          <span>Oxygen Saturation:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.oxygenSaturation.status)}`}>
                            {selectedVital.vitals.oxygenSaturation.value} {selectedVital.vitals.oxygenSaturation.unit}
                          </span>
                        </div>
                      )}
                      {selectedVital.vitals.weight && (
                        <div className="flex justify-between">
                          <span>Weight:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.weight.status)}`}>
                            {selectedVital.vitals.weight.value} {selectedVital.vitals.weight.unit}
                          </span>
                        </div>
                      )}
                      {selectedVital.vitals.respiratoryRate && (
                        <div className="flex justify-between">
                          <span>Respiratory Rate:</span>
                          <span className={`font-medium ${getStatusColor(selectedVital.vitals.respiratoryRate.status)}`}>
                            {selectedVital.vitals.respiratoryRate.value} {selectedVital.vitals.respiratoryRate.unit}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {selectedVital.notes && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{selectedVital.notes}</p>
                  </div>
                )}
                
                {selectedVital.alertsTriggered.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                      Alerts Triggered
                    </h4>
                    <div className="space-y-2">
                      {selectedVital.alertsTriggered.map((alert, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-800' :
                          alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                          'bg-blue-50 border-blue-200 text-blue-800'
                        }`}>
                          <div className="font-medium">{alert.message}</div>
                          <div className="text-xs mt-1">
                            Threshold: {alert.threshold} | Actual: {alert.actualValue}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VitalSignsHistory;