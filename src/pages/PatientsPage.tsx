import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  AlertCircle,
  Heart,
  User,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import PatientRegistrationModal from '../components/patients/PatientRegistrationModal';
import PatientDetailModal from '../components/patients/PatientDetailModal';
import Header from '../components/Header';

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

const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  // Load demo patients on component mount
  useEffect(() => {
    const demoPatients: Patient[] = [
      {
        id: 'P001',
        firstName: 'Sarah',
        lastName: 'Johnson',
        dateOfBirth: '1956-03-15',
        gender: 'Female',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        address: {
          street: '123 Oak Street',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90210'
        },
        emergencyContacts: [
          {
            name: 'John Johnson',
            relationship: 'Son',
            phone: '+1 (555) 987-6543',
            email: 'john.johnson@email.com'
          },
          {
            name: 'Mary Johnson',
            relationship: 'Daughter',
            phone: '+1 (555) 876-5432'
          }
        ],
        medicalHistory: {
          conditions: ['Hypertension', 'Type 2 Diabetes', 'Previous MI'],
          medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Aspirin 81mg'],
          allergies: ['Penicillin', 'Shellfish'],
          surgeries: ['Appendectomy (1985)', 'Cataract Surgery (2020)']
        },
        insurance: {
          provider: 'Blue Cross Blue Shield',
          policyNumber: 'BC123456789',
          groupNumber: 'GRP001'
        },
        assignedDoctor: 'Dr. Sarah Mitchell',
        status: 'critical',
        lastVisit: '2024-01-15',
        nextAppointment: '2024-01-22',
        createdAt: '2023-06-01',
        updatedAt: '2024-01-15'
      },
      {
        id: 'P002',
        firstName: 'Michael',
        lastName: 'Chen',
        dateOfBirth: '1970-08-22',
        gender: 'Male',
        email: 'michael.chen@email.com',
        phone: '+1 (555) 234-5678',
        address: {
          street: '456 Pine Avenue',
          city: 'Midtown',
          state: 'CA',
          zipCode: '90211'
        },
        emergencyContacts: [
          {
            name: 'Lisa Chen',
            relationship: 'Wife',
            phone: '+1 (555) 876-5432',
            email: 'lisa.chen@email.com'
          }
        ],
        medicalHistory: {
          conditions: ['Arrhythmia', 'High Cholesterol'],
          medications: ['Atorvastatin 20mg', 'Metoprolol 50mg'],
          allergies: ['Latex'],
          surgeries: []
        },
        insurance: {
          provider: 'Aetna',
          policyNumber: 'AET987654321',
          groupNumber: 'GRP002'
        },
        assignedDoctor: 'Dr. Sarah Mitchell',
        status: 'active',
        lastVisit: '2024-01-10',
        nextAppointment: '2024-01-25',
        createdAt: '2023-07-15',
        updatedAt: '2024-01-10'
      },
      {
        id: 'P003',
        firstName: 'Emma',
        lastName: 'Rodriguez',
        dateOfBirth: '1981-12-05',
        gender: 'Female',
        email: 'emma.rodriguez@email.com',
        phone: '+1 (555) 345-6789',
        address: {
          street: '789 Maple Drive',
          city: 'Uptown',
          state: 'CA',
          zipCode: '90212'
        },
        emergencyContacts: [
          {
            name: 'Carlos Rodriguez',
            relationship: 'Husband',
            phone: '+1 (555) 765-4321'
          }
        ],
        medicalHistory: {
          conditions: ['Asthma', 'Anxiety Disorder'],
          medications: ['Albuterol Inhaler', 'Sertraline 50mg'],
          allergies: ['Pollen', 'Dust Mites'],
          surgeries: ['Wisdom Teeth Removal (2005)']
        },
        insurance: {
          provider: 'Kaiser Permanente',
          policyNumber: 'KP456789123',
          groupNumber: 'GRP003'
        },
        assignedDoctor: 'Dr. Sarah Mitchell',
        status: 'active',
        lastVisit: '2024-01-08',
        createdAt: '2023-08-20',
        updatedAt: '2024-01-08'
      },
      {
        id: 'P004',
        firstName: 'Robert',
        lastName: 'Davis',
        dateOfBirth: '1953-06-18',
        gender: 'Male',
        email: 'robert.davis@email.com',
        phone: '+1 (555) 456-7890',
        address: {
          street: '321 Elm Street',
          city: 'Riverside',
          state: 'CA',
          zipCode: '90213'
        },
        emergencyContacts: [
          {
            name: 'Mary Davis',
            relationship: 'Wife',
            phone: '+1 (555) 654-3210',
            email: 'mary.davis@email.com'
          }
        ],
        medicalHistory: {
          conditions: ['COPD', 'Osteoarthritis', 'Sleep Apnea'],
          medications: ['Spiriva', 'Ibuprofen 400mg', 'CPAP Machine'],
          allergies: ['Codeine'],
          surgeries: ['Knee Replacement (2018)', 'Hernia Repair (2015)']
        },
        insurance: {
          provider: 'Medicare',
          policyNumber: 'MED789456123',
          groupNumber: 'MED001'
        },
        assignedDoctor: 'Dr. Sarah Mitchell',
        status: 'active',
        lastVisit: '2024-01-12',
        nextAppointment: '2024-01-28',
        createdAt: '2023-05-10',
        updatedAt: '2024-01-12'
      }
    ];

    setPatients(demoPatients);
    setFilteredPatients(demoPatients);
  }, []);

  // Filter and search patients
  useEffect(() => {
    let filtered = patients;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(patient => patient.status === statusFilter);
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, patients]);

  const handleAddPatient = (newPatient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    const patient: Patient = {
      ...newPatient,
      id: `P${String(patients.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPatients(prev => [...prev, patient]);
    setShowRegistrationModal(false);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowDetailModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowRegistrationModal(true);
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

  // Pagination
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  const stats = [
    {
      title: 'Total Patients',
      value: patients.length.toString(),
      icon: Users,
      color: 'bg-blue-500',
      change: '+12 this month'
    },
    {
      title: 'Active Patients',
      value: patients.filter(p => p.status === 'active').length.toString(),
      icon: Heart,
      color: 'bg-green-500',
      change: '89% of total'
    },
    {
      title: 'Critical Patients',
      value: patients.filter(p => p.status === 'critical').length.toString(),
      icon: AlertCircle,
      color: 'bg-red-500',
      change: 'Requires attention'
    },
    {
      title: 'New This Week',
      value: '3',
      icon: User,
      color: 'bg-purple-500',
      change: '+2 from last week'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeAlerts={patients.filter(p => p.status === 'critical').length} doctorName="Sarah Mitchell" />
      
      <main className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
              <p className="text-gray-600 mt-2">Manage patient records, demographics, and medical information</p>
            </div>
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Upload className="w-4 h-4" />
                <span>Import</span>
              </button>
              <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Add Patient</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{stat.change}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, ID, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Patient</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Contact</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Last Visit</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Next Appointment</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            {patient.firstName} {patient.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            ID: {patient.id} • Age: {calculateAge(patient.dateOfBirth)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{patient.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">{patient.email}</span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(patient.status)}`}>
                        {patient.status.toUpperCase()}
                        {patient.status === 'critical' && <AlertCircle className="w-3 h-3 inline ml-1" />}
                      </span>
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                      </div>
                    </td>
                    
                    <td className="py-4 px-6">
                      {patient.nextAppointment ? (
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(patient.nextAppointment).toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not scheduled</span>
                      )}
                    </td>
                    
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewPatient(patient)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPatient(patient)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Edit Patient"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => window.open(`tel:${patient.phone}`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Call Patient"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstPatient + 1} to {Math.min(indexOfLastPatient, filteredPatients.length)} of {filteredPatients.length} patients
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 border rounded text-sm ${
                        currentPage === page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {filteredPatients.length === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search criteria or filters.'
                : 'Get started by adding your first patient to the system.'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <button
                onClick={() => setShowRegistrationModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add First Patient
              </button>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showRegistrationModal && (
        <PatientRegistrationModal
          patient={selectedPatient}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedPatient(null);
          }}
          onSave={handleAddPatient}
        />
      )}

      {showDetailModal && selectedPatient && (
        <PatientDetailModal
          patient={selectedPatient}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPatient(null);
          }}
          onEdit={() => {
            setShowDetailModal(false);
            setShowRegistrationModal(true);
          }}
        />
      )}
    </div>
  );
};

export default PatientsPage;