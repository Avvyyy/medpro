import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  Check, 
  X, 
  Clock, 
  User, 
  MapPin,
  Filter,
  Plus,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Alert } from '../../types/alerts';
import { alertService } from '../../services/alertService';

interface AlertsPanelProps {
  patientId?: string;
  showCreateAlert?: boolean;
  onCreateAlert?: () => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({
  patientId,
  showCreateAlert = true,
  onCreateAlert
}) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'unacknowledged'>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    loadAlerts();
    
    // Subscribe to new alerts
    const unsubscribe = alertService.subscribe((newAlert) => {
      if (!patientId || newAlert.patientId === patientId) {
        loadAlerts();
      }
    });

    return unsubscribe;
  }, [patientId]);

  const loadAlerts = () => {
    const filters: any = {};
    if (patientId) filters.patientId = patientId;
    if (filter === 'critical') filters.type = 'critical';
    if (filter === 'warning') filters.type = 'warning';
    if (filter === 'unacknowledged') filters.acknowledged = false;
    
    const alertsData = alertService.getAlerts(filters);
    setAlerts(alertsData);
  };

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const handleAcknowledge = (alertId: string) => {
    const success = alertService.acknowledgeAlert(alertId, 'Dr. Sarah Mitchell');
    if (success) {
      loadAlerts();
    }
  };

  const handleResolve = (alertId: string) => {
    const success = alertService.resolveAlert(alertId, 'Dr. Sarah Mitchell');
    if (success) {
      loadAlerts();
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'manual':
        return <User className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string, acknowledged: boolean, resolved: boolean) => {
    if (resolved) return 'bg-gray-50 border-gray-200';
    if (acknowledged) {
      switch (type) {
        case 'critical': return 'bg-red-50 border-red-200 opacity-75';
        case 'warning': return 'bg-yellow-50 border-yellow-200 opacity-75';
        default: return 'bg-blue-50 border-blue-200 opacity-75';
      }
    }
    switch (type) {
      case 'critical': return 'bg-red-50 border-red-300 shadow-md';
      case 'warning': return 'bg-yellow-50 border-yellow-300';
      default: return 'bg-blue-50 border-blue-300';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  const activeAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = alerts.filter(a => a.type === 'critical' && !a.resolved);
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged && !a.resolved);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {patientId ? 'Patient Alerts' : 'System Alerts'}
              </h2>
              <p className="text-gray-600">
                {activeAlerts.length} active • {criticalAlerts.length} critical • {unacknowledgedAlerts.length} unacknowledged
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {showCreateAlert && (
              <button
                onClick={onCreateAlert}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: alerts.length },
            { key: 'critical', label: 'Critical', count: criticalAlerts.length },
            { key: 'warning', label: 'Warning', count: alerts.filter(a => a.type === 'warning' && !a.resolved).length },
            { key: 'unacknowledged', label: 'Unacknowledged', count: unacknowledgedAlerts.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-96 overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No alerts found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No alerts have been generated yet.'
                : `No ${filter} alerts at this time.`
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${getAlertColor(alert.type, alert.acknowledged, alert.resolved)}`}
                onClick={() => setSelectedAlert(alert)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-900 truncate">
                          {alert.title}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alert.priority === 'high' ? 'bg-red-100 text-red-800' :
                          alert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{alert.patientName}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                        </div>
                        {alert.metadata?.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{alert.metadata.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Status Indicators */}
                      <div className="flex items-center space-x-2 mt-2">
                        {alert.acknowledged && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            <span>Acknowledged by {alert.acknowledgedBy}</span>
                          </div>
                        )}
                        {alert.resolved && (
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <XCircle className="w-3 h-3" />
                            <span>Resolved by {alert.resolvedBy}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    {!alert.acknowledged && !alert.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(alert.id);
                        }}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Acknowledge"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {!alert.resolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResolve(alert.id);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Resolve"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAlert(alert);
                      }}
                      className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
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

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="bg-gray-50 p-4 rounded-t-xl flex justify-between items-center border-b">
              <h3 className="text-lg font-semibold text-gray-900">Alert Details</h3>
              <button
                onClick={() => setSelectedAlert(null)}
                className="text-gray-500 hover:text-gray-700 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-6">
                <div className="flex-shrink-0">
                  {getAlertIcon(selectedAlert.type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{selectedAlert.title}</h2>
                  <p className="text-gray-600 mb-4">{selectedAlert.message}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Patient:</strong> {selectedAlert.patientName}
                    </div>
                    <div>
                      <strong>Priority:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedAlert.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedAlert.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedAlert.priority}
                      </span>
                    </div>
                    <div>
                      <strong>Type:</strong> {selectedAlert.type}
                    </div>
                    <div>
                      <strong>Source:</strong> {selectedAlert.source}
                    </div>
                    <div>
                      <strong>Created:</strong> {new Date(selectedAlert.timestamp).toLocaleString()}
                    </div>
                    {selectedAlert.vitalType && (
                      <div>
                        <strong>Vital:</strong> {selectedAlert.vitalType}
                      </div>
                    )}
                    {selectedAlert.vitalValue && (
                      <div>
                        <strong>Value:</strong> {selectedAlert.vitalValue}
                      </div>
                    )}
                    {selectedAlert.threshold && (
                      <div>
                        <strong>Threshold:</strong> {selectedAlert.threshold}
                      </div>
                    )}
                  </div>

                  {selectedAlert.metadata && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold mb-2">Additional Information</h4>
                      {selectedAlert.metadata.location && (
                        <div className="text-sm"><strong>Location:</strong> {selectedAlert.metadata.location}</div>
                      )}
                      {selectedAlert.metadata.deviceId && (
                        <div className="text-sm"><strong>Device:</strong> {selectedAlert.metadata.deviceId}</div>
                      )}
                      {selectedAlert.metadata.additionalInfo && (
                        <div className="text-sm"><strong>Notes:</strong> {selectedAlert.metadata.additionalInfo}</div>
                      )}
                    </div>
                  )}

                  {/* Status Information */}
                  <div className="mt-6 space-y-3">
                    {selectedAlert.acknowledged && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Acknowledged by {selectedAlert.acknowledgedBy} on {new Date(selectedAlert.acknowledgedAt!).toLocaleString()}
                        </span>
                      </div>
                    )}
                    {selectedAlert.resolved && (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <XCircle className="w-4 h-4" />
                        <span className="text-sm">
                          Resolved by {selectedAlert.resolvedBy} on {new Date(selectedAlert.resolvedAt!).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200">
                    {!selectedAlert.acknowledged && !selectedAlert.resolved && (
                      <button
                        onClick={() => {
                          handleAcknowledge(selectedAlert.id);
                          setSelectedAlert(null);
                        }}
                        className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        <span>Acknowledge</span>
                      </button>
                    )}
                    {!selectedAlert.resolved && (
                      <button
                        onClick={() => {
                          handleResolve(selectedAlert.id);
                          setSelectedAlert(null);
                        }}
                        className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Resolve</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedAlert(null)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsPanel;