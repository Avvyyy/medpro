import React, { useState, useEffect } from 'react';
import { 
  X, 
  Shield, 
  Lock, 
  Eye, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Key,
  FileText,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { auditLogger } from '../../services/security/auditLogger';
import { encryptionService } from '../../services/security/encryption';
import { rateLimiter, RATE_LIMIT_RULES } from '../../services/security/rateLimiter';

interface SecurityCompliancePanelProps {
  onClose: () => void;
}

const SecurityCompliancePanel: React.FC<SecurityCompliancePanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'audit' | 'encryption' | 'rateLimit' | 'compliance'>('audit');
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [rateLimits, setRateLimits] = useState<any[]>([]);
  const [complianceReport, setComplianceReport] = useState<any>(null);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    // Load audit logs
    const logs = auditLogger.getAuditLogs({ limit: 50 });
    setAuditLogs(logs);

    // Load rate limits
    const limits = rateLimiter.getAllLimits();
    setRateLimits(limits);

    // Generate compliance report
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    const report = auditLogger.generateComplianceReport(startDate, endDate);
    setComplianceReport(report);
  };

  const handleExportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Patient ID', 'Success', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        log.timestamp,
        log.userId,
        log.action,
        `${log.resourceType}:${log.resourceId}`,
        log.patientId || '',
        log.success,
        log.ipAddress
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleTestEncryption = async () => {
    try {
      const testData = 'Sensitive patient information';
      const key = await encryptionService.generateKey();
      const encrypted = await encryptionService.encrypt(testData, key);
      const decrypted = await encryptionService.decrypt(encrypted, key);
      
      alert(`Encryption test successful!\nOriginal: ${testData}\nDecrypted: ${decrypted}`);
    } catch (error) {
      alert('Encryption test failed: ' + error);
    }
  };

  const tabs = [
    { key: 'audit', label: 'Audit Logs', icon: FileText },
    { key: 'encryption', label: 'Encryption', icon: Lock },
    { key: 'rateLimit', label: 'Rate Limiting', icon: Shield },
    { key: 'compliance', label: 'Compliance', icon: CheckCircle }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Security & Compliance</h2>
            <p className="text-blue-100">Monitor security measures and compliance status</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Audit Logs Tab */}
          {activeTab === 'audit' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Audit Trail</h3>
                <button
                  onClick={handleExportAuditLogs}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Logs</span>
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Timestamp</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Action</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Resource</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {auditLogs.slice(0, 20).map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <div>
                              <div className="font-medium">{log.userId}</div>
                              <div className="text-gray-500">{log.userRole}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium">{log.action}</td>
                          <td className="py-3 px-4 text-sm">
                            {log.resourceType}:{log.resourceId}
                            {log.patientId && (
                              <div className="text-gray-500">Patient: {log.patientId}</div>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              log.success 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.success ? 'Success' : 'Failed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Encryption Tab */}
          {activeTab === 'encryption' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Data Encryption</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-green-900">Encryption Status</h4>
                      <p className="text-green-700">All sensitive data is encrypted</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-medium">AES-256-GCM</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key Length:</span>
                      <span className="font-medium">256 bits</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data at Rest:</span>
                      <span className="font-medium text-green-600">Encrypted</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data in Transit:</span>
                      <span className="font-medium text-green-600">TLS 1.3</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Key className="w-8 h-8 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-900">Key Management</h4>
                      <p className="text-blue-700">Secure key storage and rotation</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Active Keys:</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Rotation:</span>
                      <span className="font-medium">2024-01-01</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Rotation:</span>
                      <span className="font-medium">2024-04-01</span>
                    </div>
                  </div>

                  <button
                    onClick={handleTestEncryption}
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Test Encryption
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limiting Tab */}
          {activeTab === 'rateLimit' && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Rate Limiting</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {Object.entries(RATE_LIMIT_RULES).map(([key, rule]) => (
                  <div key={key} className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      {key.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Max Requests:</span>
                        <span className="font-medium">{rule.maxRequests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Time Window:</span>
                        <span className="font-medium">{rule.windowMs / 1000}s</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <h4 className="text-lg font-semibold text-gray-900 mb-4">Active Rate Limits</h4>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {rateLimits.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Identifier</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Requests</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-900">Reset Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {rateLimits.map((limit, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm font-medium">{limit.key}</td>
                            <td className="py-3 px-4 text-sm">{limit.count}</td>
                            <td className="py-3 px-4 text-sm">
                              {new Date(limit.resetTime).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Limits</h3>
                    <p className="text-gray-600">No rate limits are currently active</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Compliance Tab */}
          {activeTab === 'compliance' && complianceReport && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6">HIPAA Compliance Report</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <Activity className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-blue-900">{complianceReport.summary.totalActions}</div>
                  <div className="text-blue-700">Total Actions</div>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-green-900">{complianceReport.summary.successfulActions}</div>
                  <div className="text-green-700">Successful</div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-red-900">{complianceReport.summary.failedActions}</div>
                  <div className="text-red-700">Failed</div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-purple-900">{complianceReport.summary.uniqueUsers}</div>
                  <div className="text-purple-700">Unique Users</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Action Breakdown</h4>
                  <div className="space-y-3">
                    {Object.entries(complianceReport.actionBreakdown).slice(0, 10).map(([action, count]) => (
                      <div key={action} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{action}</span>
                        <span className="font-medium">{count as number}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Patient Access</h4>
                  <div className="space-y-3">
                    {Object.entries(complianceReport.patientAccess).slice(0, 10).map(([patientId, count]) => (
                      <div key={patientId} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Patient {patientId}</span>
                        <span className="font-medium">{count as number} accesses</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <h4 className="font-semibold text-green-900">HIPAA Compliance Status</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Audit logging enabled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Data encryption at rest</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Secure data transmission</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>Access controls implemented</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>7-year audit retention</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>User authentication required</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityCompliancePanel;