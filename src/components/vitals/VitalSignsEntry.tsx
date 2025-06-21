import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Thermometer, 
  Activity, 
  Scale, 
  Stethoscope,
  Save,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { VitalSigns } from '../../types/vitals';
import { validateVitalReading, validateBloodPressure, generateAlerts } from '../../utils/vitalValidation';

interface VitalSignsEntryProps {
  patientId: string;
  patientName: string;
  onClose: () => void;
  onSave: (vitals: VitalSigns) => void;
  existingVitals?: VitalSigns;
}

const VitalSignsEntry: React.FC<VitalSignsEntryProps> = ({
  patientId,
  patientName,
  onClose,
  onSave,
  existingVitals
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidation, setShowValidation] = useState(false);

  const [formData, setFormData] = useState({
    heartRate: existingVitals?.vitals.heartRate?.value?.toString() || '',
    systolic: existingVitals?.vitals.bloodPressure?.systolic?.toString() || '',
    diastolic: existingVitals?.vitals.bloodPressure?.diastolic?.toString() || '',
    temperature: existingVitals?.vitals.temperature?.value?.toString() || '',
    oxygenSaturation: existingVitals?.vitals.oxygenSaturation?.value?.toString() || '',
    weight: existingVitals?.vitals.weight?.value?.toString() || '',
    respiratoryRate: existingVitals?.vitals.respiratoryRate?.value?.toString() || '',
    notes: existingVitals?.notes || '',
    recordedBy: 'Dr. Sarah Mitchell'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Show real-time validation
    setShowValidation(true);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // At least one vital sign must be entered
    const hasAnyVital = formData.heartRate || formData.systolic || formData.diastolic || 
                       formData.temperature || formData.oxygenSaturation || formData.weight || 
                       formData.respiratoryRate;

    if (!hasAnyVital) {
      newErrors.general = 'At least one vital sign must be entered';
    }

    // Validate individual vitals if entered
    if (formData.heartRate) {
      const hr = parseFloat(formData.heartRate);
      if (isNaN(hr) || hr < 20 || hr > 250) {
        newErrors.heartRate = 'Heart rate must be between 20-250 BPM';
      }
    }

    if (formData.systolic || formData.diastolic) {
      if (!formData.systolic || !formData.diastolic) {
        newErrors.bloodPressure = 'Both systolic and diastolic values are required';
      } else {
        const sys = parseFloat(formData.systolic);
        const dia = parseFloat(formData.diastolic);
        if (isNaN(sys) || sys < 50 || sys > 250) {
          newErrors.systolic = 'Systolic pressure must be between 50-250 mmHg';
        }
        if (isNaN(dia) || dia < 30 || dia > 150) {
          newErrors.diastolic = 'Diastolic pressure must be between 30-150 mmHg';
        }
        if (!isNaN(sys) && !isNaN(dia) && dia >= sys) {
          newErrors.bloodPressure = 'Systolic must be higher than diastolic';
        }
      }
    }

    if (formData.temperature) {
      const temp = parseFloat(formData.temperature);
      if (isNaN(temp) || temp < 90 || temp > 115) {
        newErrors.temperature = 'Temperature must be between 90-115°F';
      }
    }

    if (formData.oxygenSaturation) {
      const o2 = parseFloat(formData.oxygenSaturation);
      if (isNaN(o2) || o2 < 70 || o2 > 100) {
        newErrors.oxygenSaturation = 'Oxygen saturation must be between 70-100%';
      }
    }

    if (formData.weight) {
      const weight = parseFloat(formData.weight);
      if (isNaN(weight) || weight < 20 || weight > 800) {
        newErrors.weight = 'Weight must be between 20-800 lbs';
      }
    }

    if (formData.respiratoryRate) {
      const rr = parseFloat(formData.respiratoryRate);
      if (isNaN(rr) || rr < 5 || rr > 60) {
        newErrors.respiratoryRate = 'Respiratory rate must be between 5-60 /min';
      }
    }

    if (!formData.recordedBy.trim()) {
      newErrors.recordedBy = 'Recorded by field is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getVitalStatus = (type: string, value: string) => {
    if (!value) return null;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return null;

    if (type === 'bloodPressure' && formData.systolic && formData.diastolic) {
      const sys = parseFloat(formData.systolic);
      const dia = parseFloat(formData.diastolic);
      if (!isNaN(sys) && !isNaN(dia)) {
        return validateBloodPressure(sys, dia);
      }
    } else if (type !== 'bloodPressure') {
      return validateVitalReading(type as any, numValue);
    }
    
    return null;
  };

  const getStatusColor = (status: string | null) => {
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

  const getStatusIcon = (status: string | null) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const vitals: any = {};
      
      if (formData.heartRate) {
        const value = parseFloat(formData.heartRate);
        vitals.heartRate = {
          value,
          unit: 'BPM',
          status: validateVitalReading('heartRate', value),
          trend: 'stable'
        };
      }

      if (formData.systolic && formData.diastolic) {
        const systolic = parseFloat(formData.systolic);
        const diastolic = parseFloat(formData.diastolic);
        vitals.bloodPressure = {
          systolic,
          diastolic,
          unit: 'mmHg',
          status: validateBloodPressure(systolic, diastolic),
          trend: 'stable'
        };
      }

      if (formData.temperature) {
        const value = parseFloat(formData.temperature);
        vitals.temperature = {
          value,
          unit: '°F',
          status: validateVitalReading('temperature', value),
          trend: 'stable'
        };
      }

      if (formData.oxygenSaturation) {
        const value = parseFloat(formData.oxygenSaturation);
        vitals.oxygenSaturation = {
          value,
          unit: '%',
          status: validateVitalReading('oxygenSaturation', value),
          trend: 'stable'
        };
      }

      if (formData.weight) {
        const value = parseFloat(formData.weight);
        vitals.weight = {
          value,
          unit: 'lbs',
          status: validateVitalReading('weight', value),
          trend: 'stable'
        };
      }

      if (formData.respiratoryRate) {
        const value = parseFloat(formData.respiratoryRate);
        vitals.respiratoryRate = {
          value,
          unit: '/min',
          status: validateVitalReading('respiratoryRate', value),
          trend: 'stable'
        };
      }

      const vitalSigns: VitalSigns = {
        id: existingVitals?.id || `manual-${Date.now()}`,
        patientId,
        timestamp: new Date().toISOString(),
        recordedBy: formData.recordedBy,
        source: 'manual',
        vitals,
        notes: formData.notes,
        alertsTriggered: generateAlerts(vitals, patientId),
        createdAt: existingVitals?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(vitalSigns);
      
    } catch (error) {
      alert('Failed to save vital signs. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">
              {existingVitals ? 'Edit Vital Signs' : 'Record Vital Signs'}
            </h2>
            <p className="text-blue-100">Patient: {patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Primary Vitals */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Primary Vital Signs
              </h3>

              {/* Heart Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (BPM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="heartRate"
                    value={formData.heartRate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.heartRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 72"
                    min="20"
                    max="250"
                  />
                  {showValidation && formData.heartRate && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${
                      getStatusColor(getVitalStatus('heartRate', formData.heartRate))
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(getVitalStatus('heartRate', formData.heartRate))}
                        <span>{getVitalStatus('heartRate', formData.heartRate)?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.heartRate && <p className="text-red-500 text-sm mt-1">{errors.heartRate}</p>}
              </div>

              {/* Blood Pressure */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="number"
                      name="systolic"
                      value={formData.systolic}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.systolic || errors.bloodPressure ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Systolic"
                      min="50"
                      max="250"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="diastolic"
                      value={formData.diastolic}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.diastolic || errors.bloodPressure ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Diastolic"
                      min="30"
                      max="150"
                    />
                  </div>
                </div>
                {showValidation && formData.systolic && formData.diastolic && (
                  <div className={`mt-2 px-3 py-2 rounded text-sm font-medium border ${
                    getStatusColor(getVitalStatus('bloodPressure', ''))
                  }`}>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(getVitalStatus('bloodPressure', ''))}
                      <span>
                        {formData.systolic}/{formData.diastolic} mmHg - {getVitalStatus('bloodPressure', '')?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )}
                {(errors.systolic || errors.diastolic || errors.bloodPressure) && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.systolic || errors.diastolic || errors.bloodPressure}
                  </p>
                )}
              </div>

              {/* Temperature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°F)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="temperature"
                    value={formData.temperature}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.temperature ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 98.6"
                    min="90"
                    max="115"
                    step="0.1"
                  />
                  {showValidation && formData.temperature && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${
                      getStatusColor(getVitalStatus('temperature', formData.temperature))
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(getVitalStatus('temperature', formData.temperature))}
                        <span>{getVitalStatus('temperature', formData.temperature)?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.temperature && <p className="text-red-500 text-sm mt-1">{errors.temperature}</p>}
              </div>
            </div>

            {/* Right Column - Secondary Vitals */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-500" />
                Secondary Measurements
              </h3>

              {/* Oxygen Saturation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygen Saturation (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="oxygenSaturation"
                    value={formData.oxygenSaturation}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.oxygenSaturation ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 98"
                    min="70"
                    max="100"
                  />
                  {showValidation && formData.oxygenSaturation && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${
                      getStatusColor(getVitalStatus('oxygenSaturation', formData.oxygenSaturation))
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(getVitalStatus('oxygenSaturation', formData.oxygenSaturation))}
                        <span>{getVitalStatus('oxygenSaturation', formData.oxygenSaturation)?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.oxygenSaturation && <p className="text-red-500 text-sm mt-1">{errors.oxygenSaturation}</p>}
              </div>

              {/* Weight */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight (lbs)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 150.5"
                    min="20"
                    max="800"
                    step="0.1"
                  />
                  {showValidation && formData.weight && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${
                      getStatusColor(getVitalStatus('weight', formData.weight))
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(getVitalStatus('weight', formData.weight))}
                        <span>{getVitalStatus('weight', formData.weight)?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
              </div>

              {/* Respiratory Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiratory Rate (/min)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="respiratoryRate"
                    value={formData.respiratoryRate}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.respiratoryRate ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 16"
                    min="5"
                    max="60"
                  />
                  {showValidation && formData.respiratoryRate && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded text-xs font-medium border ${
                      getStatusColor(getVitalStatus('respiratoryRate', formData.respiratoryRate))
                    }`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(getVitalStatus('respiratoryRate', formData.respiratoryRate))}
                        <span>{getVitalStatus('respiratoryRate', formData.respiratoryRate)?.toUpperCase()}</span>
                      </div>
                    </div>
                  )}
                </div>
                {errors.respiratoryRate && <p className="text-red-500 text-sm mt-1">{errors.respiratoryRate}</p>}
              </div>

              {/* Recorded By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recorded By *
                </label>
                <select
                  name="recordedBy"
                  value={formData.recordedBy}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.recordedBy ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="Dr. Sarah Mitchell">Dr. Sarah Mitchell</option>
                  <option value="Nurse Lisa Chen">Nurse Lisa Chen</option>
                  <option value="Dr. Michael Rodriguez">Dr. Michael Rodriguez</option>
                  <option value="Nurse Jennifer Adams">Nurse Jennifer Adams</option>
                </select>
                {errors.recordedBy && <p className="text-red-500 text-sm mt-1">{errors.recordedBy}</p>}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional observations or notes about the patient's condition..."
            />
          </div>

          {/* Timestamp Info */}
          <div className="mt-4 flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>Recording time: {new Date().toLocaleString()}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {existingVitals ? 'Update Vitals' : 'Save Vitals'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VitalSignsEntry;