import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
  Monitor,
  Palette,
  Zap
} from 'lucide-react';
import { systemConfig, SystemConfiguration } from '../../services/configuration/systemConfig';

interface SystemConfigurationPanelProps {
  onClose: () => void;
}

const SystemConfigurationPanel: React.FC<SystemConfigurationPanelProps> = ({ onClose }) => {
  const [configurations, setConfigurations] = useState<SystemConfiguration[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('alert');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = () => {
    const configs = systemConfig.getAllConfigurations();
    setConfigurations(configs);
  };

  const categories = [
    { key: 'alert', label: 'Alert Settings', icon: AlertTriangle, color: 'text-red-600' },
    { key: 'security', label: 'Security', icon: Shield, color: 'text-blue-600' },
    { key: 'system', label: 'System', icon: Monitor, color: 'text-green-600' },
    { key: 'ui', label: 'User Interface', icon: Palette, color: 'text-purple-600' },
    { key: 'integration', label: 'Integrations', icon: Zap, color: 'text-yellow-600' }
  ];

  const filteredConfigs = configurations.filter(config => config.category === selectedCategory);

  const handleEdit = (configKey: string, currentValue: any) => {
    setEditingConfig(configKey);
    setEditValues({ [configKey]: currentValue });
  };

  const handleSave = async (configKey: string) => {
    const newValue = editValues[configKey];
    const result = systemConfig.updateConfiguration({
      key: configKey,
      value: newValue,
      updatedBy: 'Dr. Sarah Mitchell'
    });

    if (result.success) {
      setSaveStatus({ type: 'success', message: 'Configuration updated successfully' });
      if (result.requiresRestart) {
        setSaveStatus({ type: 'success', message: 'Configuration updated. System restart required.' });
      }
      loadConfigurations();
      setEditingConfig(null);
      setEditValues({});
    } else {
      setSaveStatus({ type: 'error', message: result.error || 'Failed to update configuration' });
    }

    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
  };

  const handleCancel = () => {
    setEditingConfig(null);
    setEditValues({});
  };

  const handleReset = (configKey: string) => {
    if (confirm('Are you sure you want to reset this configuration to its default value?')) {
      const success = systemConfig.resetToDefault(configKey, 'Dr. Sarah Mitchell');
      if (success) {
        setSaveStatus({ type: 'success', message: 'Configuration reset to default' });
        loadConfigurations();
      } else {
        setSaveStatus({ type: 'error', message: 'Failed to reset configuration' });
      }
    }
  };

  const handleExport = () => {
    const configData = systemConfig.exportConfigurations();
    const blob = new Blob([configData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_configuration_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = systemConfig.importConfigurations(content, 'Dr. Sarah Mitchell');
      
      if (result.success) {
        setSaveStatus({ 
          type: 'success', 
          message: `Successfully imported ${result.imported} configurations` 
        });
        loadConfigurations();
      } else {
        setSaveStatus({ 
          type: 'error', 
          message: `Import failed: ${result.errors.join(', ')}` 
        });
      }
    };
    reader.readAsText(file);
  };

  const renderConfigValue = (config: SystemConfiguration) => {
    const isEditing = editingConfig === config.key;
    const currentValue = isEditing ? editValues[config.key] : config.value;

    if (!config.isEditable) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">{String(config.value)}</span>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read-only</span>
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="flex items-center space-x-2">
          {config.dataType === 'boolean' ? (
            <select
              value={String(currentValue)}
              onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value === 'true' })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="true">True</option>
              <option value="false">False</option>
            </select>
          ) : config.validationRules?.allowedValues ? (
            <select
              value={String(currentValue)}
              onChange={(e) => setEditValues({ ...editValues, [config.key]: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {config.validationRules.allowedValues.map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          ) : (
            <input
              type={config.dataType === 'number' ? 'number' : 'text'}
              value={String(currentValue)}
              onChange={(e) => {
                const value = config.dataType === 'number' ? parseFloat(e.target.value) : e.target.value;
                setEditValues({ ...editValues, [config.key]: value });
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min={config.validationRules?.min}
              max={config.validationRules?.max}
            />
          )}
          <button
            onClick={() => handleSave(config.key)}
            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between">
        <span className="text-gray-900">{String(config.value)}</span>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleEdit(config.key, config.value)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Edit"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleReset(config.key)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
            title="Reset to Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">System Configuration</h2>
            <p className="text-blue-100">Manage system settings and parameters</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <label className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus.type && (
          <div className={`p-4 border-b ${
            saveStatus.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {saveStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <span className={`font-medium ${
                saveStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
              }`}>
                {saveStatus.message}
              </span>
            </div>
          </div>
        )}

        <div className="flex">
          {/* Category Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <category.icon className={`w-5 h-5 ${category.color}`} />
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {categories.find(c => c.key === selectedCategory)?.label} Settings
              </h3>
              <p className="text-gray-600">
                Configure {selectedCategory} related system parameters
              </p>
            </div>

            <div className="space-y-6">
              {filteredConfigs.map((config) => (
                <div key={config.key} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        {config.key.split('.').pop()?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h4>
                      <p className="text-gray-600 text-sm mb-3">{config.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Type: {config.dataType}</span>
                        {config.validationRules?.min !== undefined && (
                          <span>Min: {config.validationRules.min}</span>
                        )}
                        {config.validationRules?.max !== undefined && (
                          <span>Max: {config.validationRules.max}</span>
                        )}
                        {config.requiresRestart && (
                          <span className="text-orange-600 font-medium">Requires Restart</span>
                        )}
                      </div>
                    </div>
                    
                    {config.requiresRestart && (
                      <div className="ml-4">
                        <AlertTriangle className="w-5 h-5 text-orange-500" title="Requires System Restart" />
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    {renderConfigValue(config)}
                  </div>

                  <div className="mt-4 text-xs text-gray-500">
                    Last updated: {new Date(config.updatedAt).toLocaleString()} by {config.updatedBy}
                  </div>
                </div>
              ))}
            </div>

            {filteredConfigs.length === 0 && (
              <div className="text-center py-12">
                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No configurations found</h3>
                <p className="text-gray-600">No configurations available for this category.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationPanel;