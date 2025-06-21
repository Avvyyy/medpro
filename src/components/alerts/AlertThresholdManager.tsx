import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  AlertTriangle,
  Settings,
  User,
  Users
} from 'lucide-react';
import { AlertThreshold } from '../../types/alerts';
import { alertService } from '../../services/alertService';

interface AlertThresholdManagerProps {
  patientId?: string;
  onClose: () => void;
}

const AlertThresholdManager: React.FC<AlertThresholdManagerProps> = ({
  patientId,
  onClose
}) => {
  const [thresholds, setThresholds] = useState<AlertThreshold[]>([]);
  const [editingThreshold, setEditingThreshold] = useState<AlertThreshold | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    vitalType: 'heartRate' as AlertThreshold['vitalType'],
    parameter: undefined as AlertThreshold['parameter'],
    condition: 'above' as AlertThreshold['condition'],
    value: '',
    secondaryValue: '',
    severity: 'warning' as AlertThreshold['severity'],
    description: '',
    enabled: true,
    patientId: patientId || ''
  });

  useEffect(() => {
    loadThresholds();
  }, [patientId]);

  const loadThresholds = () => {
    const allThresholds = alertService.getThresholds();
    const filteredThresholds = patientId 
      ? allThresholds.filter(t => !t.patientId || t.patientId === patientId)
      : allThresholds;
    setThresholds(filteredThresholds);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      vitalType: 'heartRate',
      parameter: undefined,
      condition: 'above',
      value: '',
      secondaryValue: '',
      severity: 'warning',
      description: '',
      enabled: true,
      patientId: patientId || ''
    });
    setEditingThreshold(null);
    setShowCreateForm(false);
  };

  const handleEdit = (threshold: AlertThreshold) => {
    setFormData({
      vitalType: threshold.vitalType,
      parameter: threshold.parameter,
      condition: threshold.condition,
      value: threshold.value.toString(),
      secondaryValue: threshold.secondaryValue?.toString() || '',
      severity: threshold.severity,
      description: threshold.description || '',
      enabled: threshold.enabled,
      patientId: threshold.patientId || ''
    });
    setEditingThreshold(threshold);
    setShowCreateForm(true);
  };

  const handleSave = () => {
    const thresholdData = {
      vitalType: formData.vitalType,
      parameter: formData.parameter,
      condition: formData.condition,
      value: parseFloat(formData.value),
      secondaryValue: formData.secondaryValue ? parseFloat(formData.secondaryValue) : undefined,
      severity: formData.severity,
      description: formData.description,
      enabled: formData.enabled,
      patientId: formData.patientId || undefined,
      createdBy: 'Dr. Sarah Mitchell'
    };

    if (editingThreshold) {
      alertService.updateThreshold(editingThreshold.id, thresholdData);
    } else {
      alertService.addThreshold(thresholdData);
    }

    loadThresholds();
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this threshold?')) {
      alertService.deleteThreshold(id);
      loadThresholds();
    }
  };

  const getVitalTypeLabel = (vitalType: string, parameter?: string) => {
    const labels: Record<string, string> = {
      heartRate: 'Heart Rate',
      bloodPressure: parameter === 'systolic' ? 'Systolic BP' : parameter === 'diastolic' ? 'Diastolic BP' : 'Blood Pressure',
      temperature: 'Temperature',
      oxygenSaturation: 'Oxygen Saturation',
      weight: 'Weight',
      respiratoryRate: 'Respiratory Rate'
    };
    return labels[vitalType] || vitalType;
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      above: 'Above',
      below: 'Below',
      between: 'Between',
      outside: 'Outside Range'
    };
    return labels[condition] || condition;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const globalThresholds = thresholds.filter(t => !t.patientId);
  const patientThresholds = thresholds.filter(t => t.patientId === patientId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Alert Threshold Configuration</h2>
            <p className="text-blue-100">
              {patientId ? `Patient-specific thresholds for ${patientId}` : 'Global alert thresholds'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Threshold</span>
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
          {/* Patient-specific thresholds */}
          {patientId && (
            <div className="mb-8">
              <div className="flex items-center space-x-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Patient-Specific Thresholds</h3>
              </div>
              
              {patientThresholds.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No custom thresholds</h4>
                  <p className="text-gray-600 mb-4">This patient is using global thresholds. Create custom thresholds for personalized monitoring.</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Custom Threshold
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patientThresholds.map((threshold) => (
                    <ThresholdCard
                      key={threshold.id}
                      threshold={threshold}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      getVitalTypeLabel={getVitalTypeLabel}
                      getConditionLabel={getConditionLabel}
                      getSeverityColor={getSeverityColor}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Global thresholds */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Global Thresholds</h3>
              <span className="text-sm text-gray-600">(Apply to all patients)</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {globalThresholds.map((threshold) => (
                <ThresholdCard
                  key={threshold.id}
                  threshold={threshold}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  getVitalTypeLabel={getVitalTypeLabel}
                  getConditionLabel={getConditionLabel}
                  getSeverityColor={getSeverityColor}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Create/Edit Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gray-50 p-4 rounded-t-xl flex justify-between items-center border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingThreshold ? 'Edit Threshold' : 'Create New Threshold'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700 rounded-full p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Vital Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vital Sign Type
                    </label>
                    <select
                      name="vitalType"
                      value={formData.vitalType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="heartRate">Heart Rate</option>
                      <option value="bloodPressure">Blood Pressure</option>
                      <option value="temperature">Temperature</option>
                      <option value="oxygenSaturation">Oxygen Saturation</option>
                      <option value="weight">Weight</option>
                      <option value="respiratoryRate">Respiratory Rate</option>
                    </select>
                  </div>

                  {/* Blood Pressure Parameter */}
                  {formData.vitalType === 'bloodPressure' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Parameter
                      </label>
                      <select
                        name="parameter"
                        value={formData.parameter || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select parameter</option>
                        <option value="systolic">Systolic</option>
                        <option value="diastolic">Diastolic</option>
                      </select>
                    </div>
                  )}

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="above">Above</option>
                      <option value="below">Below</option>
                      <option value="between">Between</option>
                      <option value="outside">Outside Range</option>
                    </select>
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  {/* Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.condition === 'between' || formData.condition === 'outside' ? 'First Value' : 'Threshold Value'}
                    </label>
                    <input
                      type="number"
                      name="value"
                      value={formData.value}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter threshold value"
                      step="0.1"
                    />
                  </div>

                  {/* Secondary Value */}
                  {(formData.condition === 'between' || formData.condition === 'outside') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Second Value
                      </label>
                      <input
                        type="number"
                        name="secondaryValue"
                        value={formData.secondaryValue}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter second value"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe when this alert should trigger..."
                  />
                </div>

                {/* Patient Assignment */}
                {!patientId && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient ID (Optional)
                    </label>
                    <input
                      type="text"
                      name="patientId"
                      value={formData.patientId}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Leave empty for global threshold"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave empty to apply to all patients, or enter a specific patient ID
                    </p>
                  </div>
                )}

                {/* Enabled Toggle */}
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="enabled"
                      checked={formData.enabled}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enable this threshold</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingThreshold ? 'Update' : 'Create'} Threshold</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Threshold Card Component
interface ThresholdCardProps {
  threshold: AlertThreshold;
  onEdit: (threshold: AlertThreshold) => void;
  onDelete: (id: string) => void;
  getVitalTypeLabel: (vitalType: string, parameter?: string) => string;
  getConditionLabel: (condition: string) => string;
  getSeverityColor: (severity: string) => string;
}

const ThresholdCard: React.FC<ThresholdCardProps> = ({
  threshold,
  onEdit,
  onDelete,
  getVitalTypeLabel,
  getConditionLabel,
  getSeverityColor
}) => {
  return (
    <div className={`border rounded-lg p-4 ${threshold.enabled ? 'bg-white' : 'bg-gray-50 opacity-75'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-gray-500" />
          <h4 className="font-semibold text-gray-900">
            {getVitalTypeLabel(threshold.vitalType, threshold.parameter)}
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(threshold)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(threshold.id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Condition:</span>
          <span className="ml-2 font-medium">
            {getConditionLabel(threshold.condition)} {threshold.value}
            {threshold.secondaryValue && ` - ${threshold.secondaryValue}`}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Severity:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(threshold.severity)}`}>
            {threshold.severity.toUpperCase()}
          </span>
        </div>

        {threshold.description && (
          <div>
            <span className="text-gray-600">Description:</span>
            <p className="text-gray-700 mt-1">{threshold.description}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className={`text-xs ${threshold.enabled ? 'text-green-600' : 'text-gray-500'}`}>
            {threshold.enabled ? 'Enabled' : 'Disabled'}
          </span>
          {threshold.patientId && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Patient-specific
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertThresholdManager;