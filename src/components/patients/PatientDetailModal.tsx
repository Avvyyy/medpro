import React from 'react';
import { 
  X, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  User, 
  Heart, 
  Shield, 
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  emergencyContacts: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }[];
  medicalHistory: {
    conditions: string[];
    medications: string[];
    allergies: string[];
    surgeries: string[];
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
  };
  assignedDoctor: string;
  status: 'active' | 'inactive' | 'critical';
  lastVisit: string;
  nextAppointment?: string;
  createdAt: string;
  updatedAt: string;
}

interface PatientDetailModalProps {
  patient: Patient;
  onClose: () => void;
  onEdit: () => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onEdit
}) => {
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {patient.firstName} {patient.lastName}
              </h2>
              <p className="text-blue-100">
                Patient ID: {patient.id} • Age: {calculateAge(patient.dateOfBirth)} • {patient.gender}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(patient.status)}`}>
              {patient.status.toUpperCase()}
              {patient.status === 'critical' && <AlertCircle className="w-3 h-3 inline ml-1" />}
            </span>
            <button
              onClick={onEdit}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
              title="Edit Patient"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Personal & Contact Info */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Date of Birth</label>
                    <p className="text-gray-900">{formatDate(patient.dateOfBirth)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Gender</label>
                    <p className="text-gray-900">{patient.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Age</label>
                    <p className="text-gray-900">{calculateAge(patient.dateOfBirth)} years old</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-900">{patient.phone}</p>
                      <button
                        onClick={() => window.open(`tel:${patient.phone}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Call Patient
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-900">{patient.email}</p>
                      <button
                        onClick={() => window.open(`mailto:${patient.email}`)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Send Email
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <div>
                      <p className="text-gray-900">
                        {patient.address.street}<br />
                        {patient.address.city}, {patient.address.state} {patient.address.zipCode}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contacts */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Emergency Contacts</h3>
                </div>
                
                <div className="space-y-4">
                  {patient.emergencyContacts.map((contact, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{contact.name}</h4>
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {contact.relationship}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-400" />
                          <span className="text-sm text-gray-600">{contact.phone}</span>
                          <button
                            onClick={() => window.open(`tel:${contact.phone}`)}
                            className="text-blue-600 hover:text-blue-700 text-xs"
                          >
                            Call
                          </button>
                        </div>
                        {contact.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-3 h-3 text-gray-400" />
                            <span className="text-sm text-gray-600">{contact.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - Medical History */}
            <div className="space-y-6">
              {/* Medical Conditions */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Heart className="w-5 h-5 text-red-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Medical Conditions</h3>
                </div>
                
                <div className="space-y-2">
                  {patient.medicalHistory.conditions.length > 0 ? (
                    patient.medicalHistory.conditions.map((condition, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-900">{condition}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No medical conditions recorded</p>
                  )}
                </div>
              </div>

              {/* Current Medications */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Current Medications</h3>
                </div>
                
                <div className="space-y-2">
                  {patient.medicalHistory.medications.length > 0 ? (
                    patient.medicalHistory.medications.map((medication, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-900">{medication}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No medications recorded</p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Allergies</h3>
                </div>
                
                <div className="space-y-2">
                  {patient.medicalHistory.allergies.length > 0 ? (
                    patient.medicalHistory.allergies.map((allergy, index) => (
                      <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <p className="text-orange-900 font-medium">{allergy}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No allergies recorded</p>
                  )}
                </div>
              </div>

              {/* Previous Surgeries */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Previous Surgeries</h3>
                </div>
                
                <div className="space-y-2">
                  {patient.medicalHistory.surgeries.length > 0 ? (
                    patient.medicalHistory.surgeries.map((surgery, index) => (
                      <div key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                        <p className="text-gray-900">{surgery}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No surgeries recorded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Insurance & Care Info */}
            <div className="space-y-6">
              {/* Insurance Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Insurance Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Provider</label>
                    <p className="text-gray-900">{patient.insurance.provider || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Policy Number</label>
                    <p className="text-gray-900 font-mono">{patient.insurance.policyNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Group Number</label>
                    <p className="text-gray-900 font-mono">{patient.insurance.groupNumber || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {/* Care Team */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Care Team</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Doctor</label>
                    <p className="text-gray-900">{patient.assignedDoctor}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Patient Status</label>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(patient.status)}`}>
                      {patient.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visit Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Visit Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Visit</label>
                    <p className="text-gray-900">{formatDate(patient.lastVisit)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Next Appointment</label>
                    <p className="text-gray-900">
                      {patient.nextAppointment ? formatDate(patient.nextAppointment) : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Record Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Record Information</h3>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-gray-900">{formatDate(patient.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <p className="text-gray-900">{formatDate(patient.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                
                <div className="space-y-3">
                  <button
                    onClick={() => window.open(`tel:${patient.phone}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Patient</span>
                  </button>
                  
                  <button
                    onClick={() => window.open(`mailto:${patient.email}`)}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Email</span>
                  </button>
                  
                  <button
                    onClick={onEdit}
                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Patient</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;